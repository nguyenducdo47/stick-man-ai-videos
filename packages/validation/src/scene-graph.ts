import { z } from 'zod';

export const stickmanStyleSchema = z.object({
  style: z.literal('stickman-red-hoodie'),
  colors: z.object({
    body: z.string(),
    hoodie: z.string(),
    shoes: z.string(),
  }),
});

export const sceneGraphSceneSchema = z.object({
  scenePublicId: z.string().uuid(),
  sortOrder: z.number().int().min(0),
  title: z.string().nullable(),
  durationSec: z.number().positive().max(600),
  animationPreset: z.string().max(100),
  cameraPreset: z.string().max(100),
  description: z.string().nullable().optional(),
  characterAction: z.string().nullable().optional(),
  timeline: z.object({
    animationId: z.string(),
    cameraId: z.string(),
    easing: z.enum(['linear', 'ease-in-out']).default('ease-in-out'),
  }),
});

export const sceneGraphDocumentSchema = z.object({
  version: z.literal(1),
  projectPublicId: z.string().uuid(),
  visualStyle: z.string(),
  character: stickmanStyleSchema,
  scenes: z.array(sceneGraphSceneSchema).min(0).max(50),
  totalDurationSec: z.number().nonnegative(),
  compiledAt: z.string().datetime(),
});

export type SceneGraphDocument = z.infer<typeof sceneGraphDocumentSchema>;

export const sceneGraphResponseSchema = z.object({
  projectPublicId: z.string().uuid(),
  graph: sceneGraphDocumentSchema,
  savedPath: z.string().nullable(),
});

export type SceneGraphResponse = z.infer<typeof sceneGraphResponseSchema>;