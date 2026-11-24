import type { ZodSchema } from 'zod';

import { extractJsonText } from './json-utils.js';
import type { GenerateTextOptions, LLMProvider } from './types.js';

export interface StructuredOutputOptions extends GenerateTextOptions {
  maxAttempts?: number;
}

export async function generateStructuredOutput<T>(
  provider: LLMProvider,
  schema: ZodSchema<T>,
  prompt: string,
  options?: StructuredOutputOptions,
): Promise<T> {
  const attempts = options?.maxAttempts ?? 2;
  let lastError: Error | null = null;

  for (let i = 0; i < attempts; i++) {
    const system =
      (options?.system ?? '') +
      (i > 0
        ? '\nReturn ONLY valid JSON matching the schema. No markdown, no commentary.'
        : '');
    try {
      const raw = await provider.generateText(prompt, {
        ...options,
        system: system || undefined,
        jsonMode: true,
        numPredict: options?.numPredict ?? 4_096,
      });
      const jsonText = extractJsonText(raw);
      const parsed = JSON.parse(jsonText) as unknown;
      return schema.parse(parsed);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error('Structured output generation failed');
}