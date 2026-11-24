import { DEFAULT_TTS_URL } from '@ai-video-studio/shared';
import type { SupportedLocale } from '@ai-video-studio/shared';
import { ttsHealthResponseSchema } from '@ai-video-studio/validation';

export interface TtsClientConfig {
  baseUrl?: string;
  timeoutMs?: number;
}

export class TtsClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(config: TtsClientConfig = {}) {
    this.baseUrl = (config.baseUrl ?? DEFAULT_TTS_URL).replace(/\/$/, '');
    this.timeoutMs = config.timeoutMs ?? 120_000;
  }

  async checkHealth(): Promise<{
    reachable: boolean;
    engine?: string;
    detail?: string;
    vietnameseVoiceAvailable?: boolean;
    korvaVoices?: string[];
    korvaDefaultViVoice?: string;
    error?: string;
  }> {
    try {
      const res = await this.fetchWithTimeout(`${this.baseUrl}/health`);
      if (!res.ok) {
        return { reachable: false, error: `HTTP ${res.status}` };
      }
      const data = ttsHealthResponseSchema.parse(await res.json());
      return {
        reachable: true,
        engine: data.engine,
        detail: data.detail,
        vietnameseVoiceAvailable: data.vietnameseVoiceAvailable,
        korvaVoices: data.korvaVoices,
        korvaDefaultViVoice: data.korvaDefaultViVoice,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return { reachable: false, error: message };
    }
  }

  async synthesizeWav(
    text: string,
    locale: SupportedLocale,
    options?: { voice?: string },
  ): Promise<Uint8Array> {
    const res = await this.fetchWithTimeout(`${this.baseUrl}/v1/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        locale,
        ...(options?.voice ? { voice: options.voice } : {}),
      }),
    });
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(
        `TTS synthesize failed: HTTP ${res.status}${errBody ? ` — ${errBody}` : ''}`,
      );
    }
    const arrayBuffer = await res.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }

  private async fetchWithTimeout(
    url: string,
    init?: RequestInit,
  ): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }
}