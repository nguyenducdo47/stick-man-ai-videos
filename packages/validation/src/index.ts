import { z } from 'zod';

export const healthResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.string(),
  timestamp: z.string().datetime(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export * from './project.js';
export * from './scene.js';
export * from './dashboard.js';
export * from './ai.js';
export * from './scene-graph.js';