/**
 * @neo/ai — public barrel
 *
 * Re-exports the public API of the AI package. Consumers should import
 * from `@neo/ai` rather than reaching into submodules so internal layout
 * can change without breaking downstream callers.
 */

export * from './types';
export * from './error';
export * from './constants';
export * from './chunker';
export * from './embeddings';
export * from './retriever';
export * from './prompts';
export * from './confidence';
export {
  GeminiClient,
  getDefaultGeminiClient,
  resetDefaultGeminiClient,
} from './gemini-client';
