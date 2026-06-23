/**
 * @neo/ai — error
 *
 * Structured error type thrown by the AI package. All callers should match
 * on `code` rather than `message`.
 */

import type { AiErrorCode } from './types';

export class AiError extends Error {
  public readonly code: AiErrorCode;
  public readonly cause?: unknown;
  public readonly status?: number;
  public readonly retryAfterMs?: number;

  constructor(
    code: AiErrorCode,
    message: string,
    options: { cause?: unknown; status?: number; retryAfterMs?: number } = {},
  ) {
    super(message);
    this.name = 'AiError';
    this.code = code;
    this.cause = options.cause;
    this.status = options.status;
    this.retryAfterMs = options.retryAfterMs;
    Object.setPrototypeOf(this, AiError.prototype);
  }

  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      status: this.status,
      retryAfterMs: this.retryAfterMs,
    };
  }
}

export function isAiError(value: unknown): value is AiError {
  return value instanceof AiError;
}
