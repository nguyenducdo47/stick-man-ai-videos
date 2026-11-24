import {
  Injectable,
  OnModuleDestroy,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  renderJobResponseSchema,
  type RenderJobResponse,
} from '@ai-video-studio/validation';
import { RENDER_QUEUE_NAME, SUPPORTED_LOCALES } from '@ai-video-studio/shared';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

import { RenderAbortRegistry } from './render-abort.registry';

@Injectable()
export class RenderQueueService implements OnModuleDestroy {
  private connection: IORedis | null = null;
  private queue: Queue | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly abortRegistry: RenderAbortRegistry,
  ) {}

  private redisConnection(): IORedis {
    if (!this.connection) {
      const host = this.config.get<string>('REDIS_HOST') ?? '127.0.0.1';
      const port = Number(this.config.get<string>('REDIS_PORT') ?? '6379');
      this.connection = new IORedis({
        host,
        port,
        maxRetriesPerRequest: null,
      });
    }
    return this.connection;
  }

  private renderQueue(): Queue {
    if (!this.queue) {
      this.queue = new Queue(RENDER_QUEUE_NAME, {
        connection: this.redisConnection(),
        defaultJobOptions: {
          removeOnComplete: 50,
          removeOnFail: 100,
          attempts: 1,
        },
      });
    }
    return this.queue;
  }

  async enqueue(
    projectPublicId: string,
    locale: (typeof SUPPORTED_LOCALES)[number],
    quality: 'preview' | 'standard' | 'high' | 'hq' = 'standard',
  ): Promise<RenderJobResponse> {
    try {
      const job = await this.renderQueue().add(
        'render-locale',
        { projectPublicId, locale, quality },
        { jobId: `${projectPublicId}:${locale}:${Date.now()}` },
      );
      const body = {
        jobId: String(job.id),
        status: 'queued' as const,
        projectPublicId,
        locale,
        progress: 0,
        errorMessage: null,
      };
      return renderJobResponseSchema.parse(body);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Redis unavailable';
      throw new ServiceUnavailableException(
        `Render queue unavailable. Start Redis (Laragon) and worker. ${message}`,
      );
    }
  }

  async getJob(jobId: string): Promise<RenderJobResponse> {
    const job = await this.renderQueue().getJob(jobId);
    if (!job) {
      throw new ServiceUnavailableException(`Unknown render job ${jobId}`);
    }
    const data = job.data as {
      projectPublicId: string;
      locale: (typeof SUPPORTED_LOCALES)[number];
    };
    const state = await job.getState();
    const failedReason = job.failedReason ?? '';
    const cancelled =
      state === 'failed' && /cancelled/i.test(failedReason);
    const status =
      state === 'completed'
        ? 'completed'
        : cancelled
          ? 'cancelled'
          : state === 'failed'
            ? 'failed'
            : state === 'active'
              ? 'active'
              : 'queued';
    const progress =
      typeof job.progress === 'number'
        ? job.progress
        : Number(job.progress) || 0;
    const errorMessage =
      status === 'failed' || status === 'cancelled'
        ? job.failedReason ?? (status === 'cancelled' ? 'Cancelled' : 'Render failed')
        : null;

    return renderJobResponseSchema.parse({
      jobId: String(job.id),
      status,
      projectPublicId: data.projectPublicId,
      locale: data.locale,
      progress,
      errorMessage,
    });
  }

  async cancelJob(jobId: string): Promise<{ cancelled: boolean; jobId: string }> {
    const job = await this.renderQueue().getJob(jobId);
    if (!job) {
      throw new ServiceUnavailableException(`Unknown render job ${jobId}`);
    }
    const data = job.data as {
      projectPublicId: string;
      locale: string;
    };
    const state = await job.getState();
    if (state === 'active') {
      this.abortRegistry.abort(
        this.abortRegistry.key(data.projectPublicId, data.locale),
      );
      return { cancelled: true, jobId };
    }
    if (state === 'completed') {
      throw new ServiceUnavailableException('Render job already completed');
    }
    await job.remove();
    return { cancelled: true, jobId };
  }

  async onModuleDestroy() {
    await this.queue?.close();
    await this.connection?.quit();
  }
}