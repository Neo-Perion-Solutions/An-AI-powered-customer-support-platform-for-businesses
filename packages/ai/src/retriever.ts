/**
 * @neo/ai — retriever
 *
 * Pure in-memory cosine similarity retrieval. No database dependency — the
 * caller passes candidate `EmbeddedChunk[]` and the function returns the
 * top-K matches. This keeps the package transport-agnostic so it can be
 * used with any vector store (Postgres pgvector, MongoDB Atlas, etc.) by
 * the application layer.
 */

import type {
  Citation,
  EmbeddedChunk,
  RankedChunk,
  RetrieveOptions,
} from './types';
import { MAX_CONTEXT_TOKENS, TOP_K } from './constants';
import { AiError } from './error';
import { embedQuery } from './embeddings';
import { GeminiClient, getDefaultGeminiClient } from './gemini-client';

function dot(a: number[], b: number[]): number {
  let s = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    s += (a[i] as number) * (b[i] as number);
  }
  return s;
}

function norm(a: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    const v = a[i] as number;
    s += v * v;
  }
  return Math.sqrt(s);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new AiError('INVALID_INPUT', 'cosineSimilarity: vector length mismatch');
  }
  const na = norm(a);
  const nb = norm(b);
  if (na === 0 || nb === 0) {
    return 0;
  }
  return dot(a, b) / (na * nb);
}

function resolveTopK(options: RetrieveOptions | undefined): number {
  const raw = options?.topK ?? process.env['RAG_TOP_K'];
  if (raw) {
    const n = parseInt(raw, 10);
    if (Number.isFinite(n) && n > 0) {
      return n;
    }
  }
  return TOP_K;
}

function resolveMinScore(options: RetrieveOptions | undefined): number {
  const raw = options?.minScore;
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return raw;
  }
  return 0;
}

export async function retrieveRelevant(
  query: string,
  candidates: EmbeddedChunk[],
  options: RetrieveOptions = {},
  client: GeminiClient = getDefaultGeminiClient(),
): Promise<RankedChunk[]> {
  if (typeof query !== 'string') {
    throw new AiError('INVALID_INPUT', 'retrieveRelevant: query must be a string');
  }
  if (!Array.isArray(candidates)) {
    throw new AiError('INVALID_INPUT', 'retrieveRelevant: candidates must be an array');
  }
  if (candidates.length === 0) {
    return [];
  }

  const topK = resolveTopK(options);
  const minScore = resolveMinScore(options);
  const queryVector = await embedQuery(query, client);

  const ranked: RankedChunk[] = candidates.map((chunk) => ({
    ...chunk,
    score: cosineSimilarity(queryVector, chunk.embedding),
  }));

  ranked.sort((a, b) => b.score - a.score);

  return ranked
    .filter((c) => c.score >= minScore)
    .slice(0, topK);
}

export function formatCitations(chunks: RankedChunk[]): Citation[] {
  if (!Array.isArray(chunks)) {
    throw new AiError('INVALID_INPUT', 'formatCitations: chunks must be an array');
  }
  return chunks.map((chunk) => ({
    chunkId: chunk.id,
    score: chunk.score,
    excerpt: chunk.text.length > 320 ? `${chunk.text.slice(0, 320)}...` : chunk.text,
    startChar: chunk.startChar,
    endChar: chunk.endChar,
  }));
}

export function packContext(
  chunks: RankedChunk[],
  options: { maxTokens?: number } = {},
): string {
  if (chunks.length === 0) {
    return '';
  }
  const maxTokens = options.maxTokens ?? MAX_CONTEXT_TOKENS;
  const budget = maxTokens * 4;
  const parts: string[] = [];
  let used = 0;
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    if (!chunk) {
      continue;
    }
    const header = `[${i + 1}] (score=${chunk.score.toFixed(3)})`;
    const body = chunk.text;
    const piece = `${header}\n${body}`;
    if (used + piece.length > budget) {
      const remaining = Math.max(0, budget - used);
      if (remaining > header.length + 16) {
        parts.push(`${header}\n${body.slice(0, remaining - header.length - 4)}...`);
      }
      break;
    }
    parts.push(piece);
    used += piece.length + 2;
  }
  return parts.join('\n\n');
}
