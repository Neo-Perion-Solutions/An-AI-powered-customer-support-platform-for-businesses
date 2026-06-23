/**
 * @neo/ai — embeddings
 *
 * High-level embedding helpers that wrap `GeminiClient` with batching and
 * dimension validation. Used by the knowledge ingestion pipeline and by
 * the query-time retriever.
 */

import type {
  Chunk,
  EmbedChunksOptions,
  EmbeddedChunk,
} from './types';
import { EMBEDDING_DIMENSIONS } from './constants';
import { AiError } from './error';
import { GeminiClient, getDefaultGeminiClient } from './gemini-client';

function resolveExpectedDimensions(): number {
  const raw = process.env['EMBEDDING_DIMENSIONS'];
  if (raw) {
    const n = parseInt(raw, 10);
    if (Number.isFinite(n) && n > 0) {
      return n;
    }
  }
  return EMBEDDING_DIMENSIONS;
}

function validateVectorShape(vector: number[], expected: number, label: string): void {
  if (!Array.isArray(vector)) {
    throw new AiError('UPSTREAM_ERROR', `${label}: embedding is not an array`);
  }
  if (vector.length !== expected) {
    throw new AiError(
      'UPSTREAM_ERROR',
      `${label}: expected ${expected} dimensions, got ${vector.length}. ` +
        `Set EMBEDDING_DIMENSIONS to match your model.`,
    );
  }
  for (let i = 0; i < vector.length; i++) {
    if (typeof vector[i] !== 'number' || !Number.isFinite(vector[i] as number)) {
      throw new AiError('UPSTREAM_ERROR', `${label}: non-finite value at index ${i}`);
    }
  }
}

export async function embedChunks(
  chunks: Chunk[],
  options: EmbedChunksOptions = {},
  client: GeminiClient = getDefaultGeminiClient(),
): Promise<EmbeddedChunk[]> {
  if (!Array.isArray(chunks)) {
    throw new AiError('INVALID_INPUT', 'embedChunks: chunks must be an array');
  }
  if (chunks.length === 0) {
    return [];
  }

  const expected = resolveExpectedDimensions();
  const batchSize = Math.max(1, options.batchSize ?? 50);
  const out: EmbeddedChunk[] = [];

  for (let i = 0; i < chunks.length; i += batchSize) {
    const slice = chunks.slice(i, i + batchSize);
    const texts = slice.map((c) => c.text);
    const vectors = await client.embed(texts);
    if (vectors.length !== slice.length) {
      throw new AiError(
        'UPSTREAM_ERROR',
        `embedChunks: vector count ${vectors.length} != input count ${slice.length}`,
      );
    }
    for (let j = 0; j < slice.length; j++) {
      const chunk = slice[j];
      const vector = vectors[j];
      if (!chunk || !vector) {
        continue;
      }
      validateVectorShape(vector, expected, 'embedChunks');
      out.push({
        id: chunk.id,
        text: chunk.text,
        index: chunk.index,
        startChar: chunk.startChar,
        endChar: chunk.endChar,
        tokenEstimate: chunk.tokenEstimate,
        embedding: vector,
      });
    }
  }

  return out;
}

export async function embedQuery(
  query: string,
  client: GeminiClient = getDefaultGeminiClient(),
): Promise<number[]> {
  if (typeof query !== 'string') {
    throw new AiError('INVALID_INPUT', 'embedQuery: query must be a string');
  }
  const trimmed = query.trim();
  if (trimmed.length === 0) {
    throw new AiError('INVALID_INPUT', 'embedQuery: query is empty');
  }
  const expected = resolveExpectedDimensions();
  const [vector] = await client.embed([trimmed]);
  if (!vector) {
    throw new AiError('UPSTREAM_ERROR', 'embedQuery: no vector returned');
  }
  validateVectorShape(vector, expected, 'embedQuery');
  return vector;
}
