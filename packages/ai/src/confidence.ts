/**
 * @neo/ai — confidence
 *
 * Heuristic confidence scoring for RAG answers.
 *
 *   computeConfidence(chunks):
 *     - 0 chunks             -> 0
 *     - top-1 score >= 0.5   -> top-1 score
 *     - otherwise            -> mean of the available scores
 *
 *   shouldEscalate(confidence, keywords, threshold):
 *     - true if confidence < threshold
 *     - true if any keyword in `keywords` is present in the user message
 *     - false otherwise
 *
 * Scores are clamped to [0, 1].
 */

import type { RankedChunk } from './types';
import { CONFIDENCE_THRESHOLD } from './constants';

function clamp01(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
}

export function computeConfidence(chunks: RankedChunk[]): number {
  if (!Array.isArray(chunks) || chunks.length === 0) {
    return 0;
  }
  const sorted = [...chunks].sort((a, b) => b.score - a.score);
  const top = sorted[0];
  if (!top) {
    return 0;
  }
  if (top.score >= 0.5) {
    return clamp01(top.score);
  }
  const mean = sorted.reduce((acc, c) => acc + c.score, 0) / sorted.length;
  return clamp01(mean);
}

export function resolveThreshold(explicit?: number): number {
  if (typeof explicit === 'number' && Number.isFinite(explicit)) {
    return clamp01(explicit);
  }
  const envRaw = process.env['CONFIDENCE_THRESHOLD'];
  if (envRaw) {
    const n = parseFloat(envRaw);
    if (Number.isFinite(n)) {
      return clamp01(n);
    }
  }
  return CONFIDENCE_THRESHOLD;
}

function messageContainsKeyword(message: string, keywords: readonly string[]): boolean {
  if (typeof message !== 'string' || message.trim().length === 0) {
    return false;
  }
  const lower = message.toLowerCase();
  return keywords.some((k) => {
    if (typeof k !== 'string' || k.length === 0) {
      return false;
    }
    return lower.includes(k.toLowerCase());
  });
}

export function shouldEscalate(
  confidence: number,
  message: string,
  keywords: readonly string[],
  threshold?: number,
): boolean {
  if (!Number.isFinite(confidence)) {
    return true;
  }
  const t = resolveThreshold(threshold);
  if (confidence < t) {
    return true;
  }
  if (keywords.length > 0 && messageContainsKeyword(message, keywords)) {
    return true;
  }
  return false;
}

export function scoreDecision(
  chunks: RankedChunk[],
  message: string,
  keywords: readonly string[],
  threshold?: number,
): { confidence: number; shouldEscalate: boolean } {
  const confidence = computeConfidence(chunks);
  return {
    confidence,
    shouldEscalate: shouldEscalate(confidence, message, keywords, threshold),
  };
}
