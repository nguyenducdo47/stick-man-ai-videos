import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TtsClient } from '@ai-video-studio/audio-engine';

@Injectable()
export class TtsFactory {
  private readonly client: TtsClient;

  constructor(config: ConfigService) {
    this.client = new TtsClient({
      baseUrl: config.get<string>('TTS_SERVICE_URL'),
      timeoutMs: Number(config.get<string>('TTS_TIMEOUT_MS') ?? 120_000),
    });
  }

  create() {
    return this.client;
  }
}
