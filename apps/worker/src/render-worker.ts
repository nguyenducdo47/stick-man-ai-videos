import { Worker } from 'bullmq';
import IORedis from 'ioredis';

import { RENDER_QUEUE_NAME } from '@ai-video-studio/shared';

type RenderJobData = {
  projectPublicId: string;
  locale: string;
  quality?: 'preview' | 'standard' | 'high' | 'hq';
};

async function main() {
  const host = process.env.REDIS_HOST ?? '127.0.0.1';
  const port = Number(process.env.REDIS_PORT ?? '6379');
  const apiBase =
    process.env.API_PUBLIC_URL?.replace(/\/$/, '') ??
    `http://${process.env.API_HOST ?? '127.0.0.1'}:${process.env.API_PORT ?? '3001'}`;

  const connection = new IORedis({ host, port, maxRetriesPerRequest: null });

  const worker = new Worker<RenderJobData>(
    RENDER_QUEUE_NAME,
    async (job) => {
      const { projectPublicId, locale, quality } = job.data;
      await job.updateProgress(10);
      const res = await fetch(`${apiBase}/v1/projects/${projectPublicId}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, quality: quality ?? 'standard' }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Render HTTP ${res.status}`);
      }
      await job.updateProgress(100);
      return res.json();
    },
    { connection, concurrency: 1 },
  );

  worker.on('failed', (job, err) => {
    console.error(`[worker] render failed ${job?.id}`, err.message);
  });

  console.log(`[worker] listening on queue ${RENDER_QUEUE_NAME}`);
}

void main();