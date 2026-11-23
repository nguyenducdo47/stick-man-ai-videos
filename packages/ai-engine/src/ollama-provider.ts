import {
  DEFAULT_OLLAMA_FALLBACK_MODEL,
  DEFAULT_OLLAMA_MODEL,
  DEFAULT_OLLAMA_URL,
} from '@ai-video-studio/shared';

import type { GenerateTextOptions, LLMProvider } from './types.js';

export interface OllamaProviderConfig {
  baseUrl?: string;
  defaultModel?: string;
  fallbackModel?: string;
  timeoutMs?: number;
}

export class OllamaProvider implements LLMProvider {
  private readonly baseUrl: string;
  private readonly defaultModel: string;
  private readonly fallbackModel: string;
  private readonly timeoutMs: number;

  constructor(config: OllamaProviderConfig = {}) {
    this.baseUrl = (config.baseUrl ?? DEFAULT_OLLAMA_URL).replace(/\/$/, '');
    this.defaultModel = config.defaultModel ?? DEFAULT_OLLAMA_MODEL;
    this.fallbackModel = config.fallbackModel ?? DEFAULT_OLLAMA_FALLBACK_MODEL;
    this.timeoutMs = config.timeoutMs ?? 300_000;
  }

  async checkHealth(): Promise<{ reachable: boolean; error?: string }> {
    try {
      const res = await this.fetchWithTimeout(`${this.baseUrl}/api/tags`);
      if (!res.ok) {
        return { reachable: false, error: `HTTP ${res.status}` };
      }
      return { reachable: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return { reachable: false, error: message };
    }
  }

  async listModels(): Promise<string[]> {
    const res = await this.fetchWithTimeout(`${this.baseUrl}/api/tags`);
    if (!res.ok) {
      throw new Error(`Ollama listModels failed: HTTP ${res.status}`);
    }
    const data = (await res.json()) as { models?: { name: string }[] };
    return (data.models ?? []).map((m) => m.name);
  }

  async verifyModel(model: string): Promise<boolean> {
    const models = await this.listModels();
    return models.some((m) => m === model || m.startsWith(`${model}:`));
  }

  async generateText(prompt: string, options?: GenerateTextOptions): Promise<string> {
    const model = options?.model ?? this.defaultModel;
    const models = await this.listModels();
    const resolved =
      models.find((m) => m === model || m.startsWith(`${model}`)) ??
      (await this.verifyModel(this.fallbackModel) ? this.fallbackModel : null);

    if (!resolved) {
      throw new Error(`No Ollama model available. Requested "${model}", fallback "${this.fallbackModel}".`);
    }

    const res = await this.fetchWithTimeout(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: resolved,
        prompt,
        system: options?.system,
        stream: false,
        options: { temperature: options?.temperature ?? 0.7 },
      }),
    });

    if (!res.ok) {
      throw new Error(`Ollama generate failed: HTTP ${res.status}`);
    }

    const data = (await res.json()) as { response?: string };
    if (!data.response?.trim()) {
      throw new Error('Ollama returned an empty response');
    }
    return data.response;
  }

  private async fetchWithTimeout(
    url: string,
    init?: RequestInit,
  ): Promise<Response> {
    const timeoutMs = this.timeoutMs;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }
}