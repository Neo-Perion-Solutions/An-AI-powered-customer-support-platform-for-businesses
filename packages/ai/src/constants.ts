/**
 * @neo/ai — constants
 *
 * Default constants for the AI package. These mirror the values in
 * `@neo/shared` (`RAG_DEFAULTS`) but are duplicated here so the AI package
 * remains self-contained and importable without a build step on the shared
 * package. When both are present, the shared values take precedence at the
 * integration boundary; the local constants act as safe fallbacks.
 */

export const EMBEDDING_DIMENSIONS = 768;
export const CHUNK_SIZE = 800;
export const CHUNK_OVERLAP = 100;
export const TOP_K = 5;
export const CONFIDENCE_THRESHOLD = 0.7;
export const MAX_CONTEXT_TOKENS = 3000;

export const GEMINI_CHAT_MODEL = 'gemini-2.0-flash';
export const GEMINI_EMBEDDING_MODEL = 'text-embedding-004';

export const GEMINI_CHAT_RPM = 15;
export const GEMINI_EMBEDDING_RPM = 1500;

export const MAX_RETRIES = 4;
export const BASE_BACKOFF_MS = 500;
export const MAX_BACKOFF_MS = 16_000;

export const CHARS_PER_TOKEN = 4;

export const DEFAULT_SYSTEM_PROMPT =
  'You are a helpful customer support assistant. Use only the provided knowledge base context to answer. If you are unsure, say so and offer to escalate to a human agent.';

export const DEFAULT_FALLBACK_MESSAGE =
  'I am not sure about that. Let me connect you with a human.';
