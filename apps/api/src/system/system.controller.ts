import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_NAME } from '@ai-video-studio/shared';
import { healthResponseSchema } from '@ai-video-studio/validation';

import { OllamaFactory } from '../ai/ollama.factory';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class SystemController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ollamaFactory: OllamaFactory,
    private readonly config: ConfigService,
  ) {}

  @Get('health')
  getHealth() {
    const body = {
      status: 'ok' as const,
      service: 'api',
      timestamp: new Date().toISOString(),
    };
    return healthResponseSchema.parse(body);
  }

  @Get('v1/system/info')
  getInfo() {
    return {
      name: APP_NAME,
      phase: 3,
      message:
        'Stickman scene graph compile + 3D preview; Ollama script/storyboard from Phase 2.',
    };
  }

  @Get('v1/system/db')
  async getDatabaseStatus() {
    try {
      await this.prisma.client.$queryRaw`SELECT 1`;
      return { connected: true as const };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return { connected: false as const, error: message };
    }
  }

  @Get('v1/ollama/status')
  async getOllamaStatus() {
    const ollama = this.ollamaFactory.create();
    const defaultModel =
      this.config.get<string>('OLLAMA_DEFAULT_MODEL') ?? 'qwen3:4b';
    const health = await ollama.checkHealth();
    if (!health.reachable) {
      return {
        reachable: false,
        error: health.error,
        models: [] as string[],
        defaultModel,
      };
    }
    try {
      const models = await ollama.listModels();
      const hasDefault = await ollama.verifyModel(defaultModel);
      return {
        reachable: true,
        models,
        defaultModel,
        defaultModelAvailable: hasDefault,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return {
        reachable: true,
        error: message,
        models: [] as string[],
        defaultModel,
      };
    }
  }
}
