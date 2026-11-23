import { Controller, Get } from '@nestjs/common';
import { APP_NAME } from '@ai-video-studio/shared';
import { OllamaProvider } from '@ai-video-studio/ai-engine';
import { healthResponseSchema } from '@ai-video-studio/validation';

import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class SystemController {
  constructor(private readonly prisma: PrismaService) {}
  private readonly ollama = new OllamaProvider({
    baseUrl: process.env.OLLAMA_BASE_URL,
    defaultModel: process.env.OLLAMA_DEFAULT_MODEL,
    fallbackModel: process.env.OLLAMA_FALLBACK_MODEL,
    timeoutMs: Number(process.env.OLLAMA_TIMEOUT_MS ?? 10_000),
  });

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
      phase: 1,
      message:
        'Project and scene CRUD with PostgreSQL — AI storyboard lands in Phase 2.',
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
    const health = await this.ollama.checkHealth();
    if (!health.reachable) {
      return {
        reachable: false,
        error: health.error,
        models: [] as string[],
        defaultModel: process.env.OLLAMA_DEFAULT_MODEL ?? 'qwen3:4b',
      };
    }
    try {
      const models = await this.ollama.listModels();
      const defaultModel = process.env.OLLAMA_DEFAULT_MODEL ?? 'qwen3:4b';
      const hasDefault = await this.ollama.verifyModel(defaultModel);
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
        defaultModel: process.env.OLLAMA_DEFAULT_MODEL ?? 'qwen3:4b',
      };
    }
  }
}
