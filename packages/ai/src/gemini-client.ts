/**
 * @neo/ai — gemini-client
 *
 * Thin async wrapper over the official `@google/generative-ai` SDK that:
 *   - centralises API key + model configuration
 *   - enforces rate limits via a sliding-window gate
 *   - retries on 429 / 5xx with exponential backoff and jitter
 *   - normalises errors into `AiError`
 *
 * This module is the ONLY place that talks to Google. Higher-level wrappers
 * (`embeddings.ts`, `prompts.ts`) call into `GeminiClient`.
 */

import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';
import type {
  ChatMessage,
  GeminiConfig,
} from './types';
import {
  BASE_BACKOFF_MS,
  GEMINI_CHAT_MODEL,
  GEMINI_CHAT_RPM,
  GEMINI_EMBEDDING_MODEL,
  GEMINI_EMBEDDING_RPM,
  MAX_BACKOFF_MS,
  MAX_RETRIES,
} from './constants';
import { AiError } from './error';

type ChatHistoryItem = {
  role: 'user' | 'model';
  parts: { text: string }[];
};

function resolveApiKey(explicit?: string): string {
  const key = explicit ?? process.env['GEMINI_API_KEY'] ?? process.env['GOOGLE_API_KEY'];
  if (!key || key.length === 0) {
    throw new AiError(
      'INVALID_INPUT',
      'Gemini API key missing. Set GEMINI_API_KEY or pass apiKey explicitly.',
    );
  }
  return key;
}

function resolveConfig(partial: Partial<GeminiConfig> = {}): GeminiConfig {
  return {
    apiKey: resolveApiKey(partial.apiKey),
    chatModel: partial.chatModel ?? GEMINI_CHAT_MODEL,
    embeddingModel: partial.embeddingModel ?? GEMINI_EMBEDDING_MODEL,
    chatRpm: partial.chatRpm ?? GEMINI_CHAT_RPM,
    embeddingRpm: partial.embeddingRpm ?? GEMINI_EMBEDDING_RPM,
    maxRetries: partial.maxRetries ?? MAX_RETRIES,
    baseBackoffMs: partial.baseBackoffMs ?? BASE_BACKOFF_MS,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jitter(ms: number): number {
  return Math.floor(ms * (0.5 + Math.random() * 0.5));
}

function isRateLimitStatus(status: number | undefined): boolean {
  return status === 429 || status === 503;
}

function getStatusFromError(err: unknown): number | undefined {
  if (err && typeof err === 'object') {
    const e = err as { status?: number; statusCode?: number; code?: number; response?: { status?: number } };
    return e.status ?? e.statusCode ?? e.code ?? e.response?.status;
  }
  return undefined;
}

function getRetryAfterMs(err: unknown): number | undefined {
  if (!err || typeof err !== 'object') {
    return undefined;
  }
  const e = err as {
    details?: Array<{ '@type'?: string; retryDelay?: string }>;
    errorDetails?: Array<{ '@type'?: string; retryDelay?: string }>;
  };
  const details = e.details ?? e.errorDetails ?? [];
  for (const d of details) {
    if (d.retryDelay) {
      const match = d.retryDelay.match(/^(\d+(?:\.\d+)?)s$/);
      if (match && match[1]) {
        return Math.ceil(parseFloat(match[1]) * 1000);
      }
    }
  }
  return undefined;
}

function normaliseUpstreamError(err: unknown, context: string): AiError {
  const status = getStatusFromError(err);
  const message = err instanceof Error ? err.message : String(err);
  if (isRateLimitStatus(status)) {
    return new AiError('RATE_LIMIT', `${context}: ${message}`, {
      cause: err,
      status,
      retryAfterMs: getRetryAfterMs(err),
    });
  }
  return new AiError('UPSTREAM_ERROR', `${context}: ${message}`, {
    cause: err,
    status,
  });
}

class RateGate {
  private readonly windowMs: number;
  private readonly maxPerWindow: number;
  private timestamps: number[] = [];

  constructor(rpm: number) {
    this.maxPerWindow = Math.max(1, rpm);
    this.windowMs = 60_000;
  }

  async acquire(): Promise<void> {
    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);
    if (this.timestamps.length < this.maxPerWindow) {
      this.timestamps.push(now);
      return;
    }
    const oldest = this.timestamps[0] ?? now;
    const wait = this.windowMs - (now - oldest) + 25;
    await sleep(Math.max(50, wait));
    this.timestamps.push(Date.now());
  }
}

export class GeminiClient {
  private readonly client: GoogleGenerativeAI;
  private readonly chatModel: GenerativeModel;
  private readonly embeddingModel: GenerativeModel;
  private readonly chatGate: RateGate;
  private readonly embeddingGate: RateGate;
  private readonly maxRetries: number;
  private readonly baseBackoffMs: number;
  private readonly embeddingModelName: string;
  private readonly chatModelName: string;

  constructor(partial: Partial<GeminiConfig> = {}) {
    const cfg = resolveConfig(partial);
    this.client = new GoogleGenerativeAI(cfg.apiKey);
    this.chatModel = this.client.getGenerativeModel({ model: cfg.chatModel });
    this.embeddingModelName = cfg.embeddingModel;
    this.chatModelName = cfg.chatModel;
    this.embeddingModel = this.client.getGenerativeModel({ model: cfg.embeddingModel });
    this.chatGate = new RateGate(cfg.chatRpm);
    this.embeddingGate = new RateGate(cfg.embeddingRpm);
    this.maxRetries = cfg.maxRetries;
    this.baseBackoffMs = cfg.baseBackoffMs;
  }

  public get embeddingModelId(): string {
    return this.embeddingModelName;
  }

  public get chatModelId(): string {
    return this.chatModelName ?? GEMINI_CHAT_MODEL;
  }

  public async embed(texts: string[]): Promise<number[][]> {
    if (!Array.isArray(texts)) {
      throw new AiError('INVALID_INPUT', 'embed: texts must be an array of strings');
    }
    const cleaned = texts.map((t, i) => {
      if (typeof t !== 'string') {
        throw new AiError('INVALID_INPUT', `embed: texts[${i}] is not a string`);
      }
      return t.trim();
    });
    if (cleaned.length === 0) {
      return [];
    }
    if (cleaned.some((t) => t.length === 0)) {
      throw new AiError('INVALID_INPUT', 'embed: empty string in batch');
    }

    return this.runWithRetry('embed', async () => {
      await this.embeddingGate.acquire();
      const result = await this.embeddingModel.batchEmbedContents({
        requests: cleaned.map((text) => ({
          content: { role: 'user', parts: [{ text }] },
        })),
      });
      const vectors: number[][] = [];
      for (const e of result.embeddings) {
        if (!e.values || e.values.length === 0) {
          throw new AiError('UPSTREAM_ERROR', 'embed: empty embedding vector in response');
        }
        vectors.push(Array.from(e.values));
      }
      return vectors;
    });
  }

  public async chat(
    systemPrompt: string,
    userMessage: string,
    history: ChatMessage[] = [],
  ): Promise<string> {
    if (typeof systemPrompt !== 'string' || typeof userMessage !== 'string') {
      throw new AiError('INVALID_INPUT', 'chat: systemPrompt and userMessage must be strings');
    }
    if (userMessage.trim().length === 0) {
      throw new AiError('INVALID_INPUT', 'chat: userMessage is empty');
    }

    const chatHistory: ChatHistoryItem[] = history
      .filter((m): m is ChatMessage & { role: 'user' | 'model' } => m.role === 'user' || m.role === 'model')
      .map((m) => ({ role: m.role, parts: [{ text: m.content }] }));

    return this.runWithRetry('chat', async () => {
      await this.chatGate.acquire();
      const session = this.chatModel.startChat({
        history: chatHistory,
        systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] },
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          maxOutputTokens: 1024,
        },
      });
      const result = await session.sendMessage(userMessage);
      const text = result.response.text();
      if (typeof text !== 'string') {
        throw new AiError('UPSTREAM_ERROR', 'chat: response.text() returned non-string');
      }
      return text;
    });
  }

  public async stream(
    systemPrompt: string,
    userMessage: string,
    onChunk: (text: string) => void,
    history: ChatMessage[] = [],
  ): Promise<void> {
    if (typeof onChunk !== 'function') {
      throw new AiError('INVALID_INPUT', 'stream: onChunk must be a function');
    }
    if (typeof systemPrompt !== 'string' || typeof userMessage !== 'string') {
      throw new AiError('INVALID_INPUT', 'stream: systemPrompt and userMessage must be strings');
    }

    const chatHistory: ChatHistoryItem[] = history
      .filter((m): m is ChatMessage & { role: 'user' | 'model' } => m.role === 'user' || m.role === 'model')
      .map((m) => ({ role: m.role, parts: [{ text: m.content }] }));

    return this.runWithRetry('stream', async () => {
      await this.chatGate.acquire();
      const session = this.chatModel.startChat({
        history: chatHistory,
        systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] },
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          maxOutputTokens: 1024,
        },
      });
      const streamResult = await session.sendMessageStream(userMessage);
      for await (const chunk of streamResult.stream) {
        const text = chunk.text();
        if (typeof text === 'string' && text.length > 0) {
          onChunk(text);
        }
      }
    });
  }

  private async runWithRetry<T>(label: string, op: () => Promise<T>): Promise<T> {
    let attempt = 0;
    let lastError: unknown = undefined;
    while (attempt <= this.maxRetries) {
      try {
        return await op();
      } catch (raw) {
        lastError = raw;
        const status = getStatusFromError(raw);
        const retryable = isRateLimitStatus(status) || (typeof status === 'number' && status >= 500);
        if (!retryable || attempt === this.maxRetries) {
          throw normaliseUpstreamError(raw, label);
        }
        const backoff = Math.min(
          MAX_BACKOFF_MS,
          this.baseBackoffMs * Math.pow(2, attempt),
        );
        const retryAfter = getRetryAfterMs(raw);
        const delay = retryAfter !== undefined ? Math.max(retryAfter, jitter(backoff)) : jitter(backoff);
        await sleep(delay);
        attempt++;
      }
    }
    throw normaliseUpstreamError(lastError, label);
  }
}

let defaultClient: GeminiClient | undefined;

export function getDefaultGeminiClient(): GeminiClient {
  if (!defaultClient) {
    defaultClient = new GeminiClient();
  }
  return defaultClient;
}

export function resetDefaultGeminiClient(): void {
  defaultClient = undefined;
}
