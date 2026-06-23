/**
 * @neo/ai — chunker
 *
 * Sentence-boundary-aware text chunker. Splits documents into overlapping
 * windows suitable for embedding. Avoids breaking mid-sentence when possible.
 *
 * Algorithm:
 *   1. Split the input into sentences using a regex that handles common
 *      terminators (`.`, `!`, `?`, newlines, semicolons) and respects common
 *      abbreviations.
 *   2. Greedily pack sentences into chunks of up to `chunkSize` characters.
 *   3. Emit each chunk with `chunkOverlap` characters of trailing text
 *      carried over to the next chunk for context preservation.
 *
 * Token estimation: `chars / CHARS_PER_TOKEN` (rounded up). This is an
 * approximation; Gemini counts tokens differently but this is good enough
 * for budget guards.
 */

import { v4 as uuidv4 } from 'uuid';
import type { Chunk, ChunkOptions } from './types';
import {
  CHARS_PER_TOKEN,
  CHUNK_OVERLAP,
  CHUNK_SIZE,
} from './constants';

const WHITESPACE_REGEX = /\s+/g;

const ABBREVIATIONS = new Set([
  'mr',
  'mrs',
  'ms',
  'dr',
  'prof',
  'sr',
  'jr',
  'st',
  'mt',
  'no',
  'vs',
  'etc',
  'e.g',
  'i.e',
  'a.m',
  'p.m',
  'u.s',
  'u.k',
]);

function splitSentences(text: string): string[] {
  const normalized = text.replace(/
/g, '
').trim();
  if (normalized.length === 0) {
    return [];
  }

  const sentences: string[] = [];
  let buffer = '';
  let lastWasAbbrev = false;

  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    buffer += ch;

    if (ch === '.' || ch === '!' || ch === '?') {
      const lower = buffer.trim().toLowerCase();
      const tail = lower.slice(-Math.min(lower.length, 6));
      const isAbbrev = [...ABBREVIATIONS].some((a) => tail === a || tail.endsWith(` ${a}`));
      const isDecimal = ch === '.' && i + 1 < normalized.length && /\d/.test(normalized[i + 1] ?? '');

      if (!isAbbrev && !isDecimal && !lastWasAbbrev) {
        sentences.push(buffer.trim());
        buffer = '';
      }
      lastWasAbbrev = isAbbrev;
      continue;
    }

    if (ch === '
' && normalized[i + 1] === '
') {
      if (buffer.trim().length > 0) {
        sentences.push(buffer.trim());
      }
      buffer = '';
      i++;
      lastWasAbbrev = false;
      continue;
    }

    if (ch === ';' || ch === ':') {
      if (buffer.trim().length > 0) {
        sentences.push(buffer.trim());
      }
      buffer = '';
      lastWasAbbrev = false;
    }
  }

  if (buffer.trim().length > 0) {
    sentences.push(buffer.trim());
  }

  return sentences.filter((s) => s.replace(WHITESPACE_REGEX, '').length > 0);
}

function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / CHARS_PER_TOKEN));
}

function joinSentences(sentences: string[], maxLen: number): string[] {
  const pieces: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const candidate = current.length === 0 ? sentence : `${current} ${sentence}`;
    if (candidate.length <= maxLen) {
      current = candidate;
      continue;
    }

    if (current.length > 0) {
      pieces.push(current);
    }

    if (sentence.length > maxLen) {
      const hardPieces = hardSplit(sentence, maxLen);
      pieces.push(...hardPieces.slice(0, -1));
      current = hardPieces[hardPieces.length - 1] ?? '';
    } else {
      current = sentence;
    }
  }

  if (current.length > 0) {
    pieces.push(current);
  }

  return pieces;
}

function hardSplit(text: string, maxLen: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < text.length; i += maxLen) {
    out.push(text.slice(i, i + maxLen));
  }
  return out;
}

function computeOverlap(text: string, overlap: number): string {
  if (overlap <= 0 || text.length <= overlap) {
    return '';
  }
  const tail = text.slice(text.length - overlap);
  const firstSpace = tail.indexOf(' ');
  if (firstSpace === -1 || firstSpace === tail.length - 1) {
    return tail;
  }
  return tail.slice(firstSpace + 1);
}

export function chunkText(text: string, options: ChunkOptions = {}): Chunk[] {
  if (typeof text !== 'string') {
    throw new TypeError('chunkText: text must be a string');
  }

  const chunkSize = Math.max(1, options.chunkSize ?? CHUNK_SIZE);
  const chunkOverlap = Math.max(0, Math.min(options.chunkOverlap ?? CHUNK_OVERLAP, chunkSize - 1));

  const trimmed = text.replace(/
/g, '
').trim();
  if (trimmed.length === 0) {
    return [];
  }

  if (trimmed.length <= chunkSize) {
    return [
      {
        id: uuidv4(),
        text: trimmed,
        index: 0,
        startChar: 0,
        endChar: trimmed.length,
        tokenEstimate: estimateTokens(trimmed),
      },
    ];
  }

  const sentences = splitSentences(trimmed);
  const packed = joinSentences(sentences, chunkSize);
  const chunks: Chunk[] = [];

  let cursor = 0;
  for (let i = 0; i < packed.length; i++) {
    const piece = packed[i] ?? '';
    if (piece.length === 0) {
      continue;
    }

    const startChar = trimmed.indexOf(piece, cursor);
    const safeStart = startChar === -1 ? cursor : startChar;
    const endChar = safeStart + piece.length;
    cursor = endChar;

    chunks.push({
      id: uuidv4(),
      text: piece,
      index: i,
      startChar: safeStart,
      endChar,
      tokenEstimate: estimateTokens(piece),
    });

    if (chunkOverlap > 0 && i < packed.length - 1) {
      const overlapText = computeOverlap(piece, chunkOverlap);
      if (overlapText.length > 0) {
        const next = packed[i + 1] ?? '';
        const merged = `${overlapText} ${next}`.trim();
        packed[i + 1] = merged.length <= chunkSize ? merged : next;
      }
    }
  }

  return chunks;
}
