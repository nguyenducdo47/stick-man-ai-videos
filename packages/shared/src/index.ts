export const APP_NAME = 'AI Video Studio' as const;

export const SUPPORTED_LOCALES = ['vi', 'en'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_OLLAMA_URL = 'http://127.0.0.1:11434' as const;
export const DEFAULT_OLLAMA_MODEL = 'qwen3:4b' as const;
export const DEFAULT_OLLAMA_FALLBACK_MODEL = 'qwen3:1.7b' as const;

export const DEFAULT_TTS_URL = 'http://127.0.0.1:5001' as const;

export { RENDER_QUEUE_NAME } from './queues.js';