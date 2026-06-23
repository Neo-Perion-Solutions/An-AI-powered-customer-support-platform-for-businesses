/**
 * @neo/ai — types
 *
 * Shared TypeScript types for the AI package. All shapes are `type` aliases
 * (no `interface`) to keep them compatible with structural typing and
 * avoid nominal-class mismatches across module boundaries.
 */

export type ChatMessageRole = 'user' | 'model' | 'system';

export type ChatMessage = {
  role: ChatMessageRole;
  content: string;
};

/**
 * A single chunk produced by the chunker. Position metadata is preserved so
 * downstream code can highlight source ranges or re-hydrate citation offsets.
 */
export type Chunk = {
  id: string;
  text: string;
  index: number;
  startChar: number;
  endChar: number;
  tokenEstimate: number;
};

/**
 * A chunk paired with its embedding vector. The vector length is validated
 * against `EMBEDDING_DIMENSIONS` at construction time.
 */
export type EmbeddedChunk = {
  id: string;
  text: string;
  index: number;
  startChar: number;
  endChar: number;
  tokenEstimate: number;
  embedding: number[];
};

/**
 * A retrieved chunk with a cosine similarity score (0..1 range; values can be
 * slightly negative for opposite directions but are typically floored at 0).
 */
export type RankedChunk = EmbeddedChunk & {
  score: number;
};

/**
 * Compact citation record persisted in `Message.citations` JSON field.
 */
export type Citation = {
  chunkId: string;
  sourceId?: string;
  score: number;
  excerpt: string;
  startChar?: number;
  endChar?: number;
};

export type RagContext = {
  question: string;
  chunks: RankedChunk[];
};

export type RagResult = {
  answer: string;
  citations: Citation[];
  confidence: number;
  shouldEscalate: boolean;
  context: RagContext;
};

export type AiErrorCode = 'RATE_LIMIT' | 'INVALID_INPUT' | 'UPSTREAM_ERROR';

export type GeminiConfig = {
  apiKey: string;
  chatModel: string;
  embeddingModel: string;
  chatRpm: number;
  embeddingRpm: number;
  maxRetries: number;
  baseBackoffMs: number;
};

export type ChunkOptions = {
  chunkSize?: number;
  chunkOverlap?: number;
};

export type EmbedChunksOptions = {
  batchSize?: number;
};

export type RetrieveOptions = {
  topK?: number;
  minScore?: number;
};
