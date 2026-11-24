import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OllamaProvider } from '@ai-video-studio/ai-engine';

@Injectable()
export class OllamaFactory {
  private readonly provider: OllamaProvider;

  constructor(config: ConfigService) {
    this.provider = new OllamaProvider({
      baseUrl: config.get<string>('OLLAMA_BASE_URL'),
      defaultModel: config.get<string>('OLLAMA_DEFAULT_MODEL'),
      fallbackModel: config.get<string>('OLLAMA_FALLBACK_MODEL'),
      timeoutMs: Number(config.get<string>('OLLAMA_TIMEOUT_MS') ?? 300_000),
    });
  }

  create() {
    return this.provider;
  }
}
