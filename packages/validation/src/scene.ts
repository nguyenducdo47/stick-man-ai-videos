import { z } from 'zod';

import { SUPPORTED_LOCALES } from '@ai-video-studio/shared';

const localeSchema = z.enum(SUPPORTED_LOCALES);

export const createSceneSchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().max(5000).optional(),
  characterAction: z.string().max(2000).optional(),
  animationPreset: z.string().max(100).optional(),
  cameraPreset: z.string().max(100).optional(),
  durationSec: z.number().positive().max(600).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export type CreateSceneInput = z.infer<typeof createSceneSchema>;

export const updateSceneSchema = createSceneSchema.partial();

export type UpdateSceneInput = z.infer<typeof updateSceneSchema>;

export const sceneLocalizationSchema = z.object({
  narration: z.string().max(10_000).optional(),
  subtitles: z.string().max(10_000).optional(),
});

export type SceneLocalizationInput = z.infer<typeof sceneLocalizationSchema>;

export const sceneLocalizationResponseSchema = z.object({
  locale: localeSchema,
  narration: z.string().nullable(),
  subtitles: z.string().nullable(),
});

export const sceneResponseSchema = z.object({
  publicId: z.string().uuid(),
  sortOrder: z.number().int(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  characterAction: z.string().nullable(),
  animationPreset: z.string().nullable(),
  cameraPreset: z.string().nullable(),
  durationSec: z.number().nullable(),
  localizations: z.array(sceneLocalizationResponseSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type SceneResponse = z.infer<typeof sceneResponseSchema>;

export const sceneListResponseSchema = z.object({
  items: z.array(sceneResponseSchema),
});

export type SceneListResponse = z.infer<typeof sceneListResponseSchema>;