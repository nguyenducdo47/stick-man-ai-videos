import { z } from 'zod';

import { SUPPORTED_LOCALES } from '@ai-video-studio/shared';

const localeSchema = z.enum(SUPPORTED_LOCALES);

export const renderClipSchema = z.object({
  scenePublicId: z.string().uuid(),
  sortOrder: z.number().int().min(0),
  title: z.string().nullable(),
  durationSec: z.number().positive(),
  /** HTTP(S) URL — Remotion cannot load file:// paths during render. */
  audioSrc: z.string().url(),
  animationPreset: z.string(),
  cameraPreset: z.string(),
  characterColors: z.object({
    body: z.string(),
    hoodie: z.string(),
    shoes: z.string(),
  }),
});

export type RenderClip = z.infer<typeof renderClipSchema>;

export const projectRenderRequestSchema = z.object({
  locale: localeSchema,
});

export type ProjectRenderRequest = z.infer<typeof projectRenderRequestSchema>;

export const projectRenderResponseSchema = z.object({
  projectPublicId: z.string().uuid(),
  locale: localeSchema,
  status: z.enum(['SUCCESS', 'FAILED']),
  videoPath: z.string().nullable(),
  videoUrl: z.string().nullable(),
  durationSec: z.number().nullable(),
  sceneCount: z.number().int().nullable(),
  errorMessage: z.string().nullable(),
  renderedAt: z.string().datetime().nullable(),
});

export type ProjectRenderResponse = z.infer<typeof projectRenderResponseSchema>;

export const projectRenderItemSchema = z.object({
  locale: localeSchema,
  status: z.enum(['SUCCESS', 'FAILED']),
  videoPath: z.string().nullable(),
  videoUrl: z.string().nullable(),
  durationSec: z.number().nullable(),
  sceneCount: z.number().int().nullable(),
  errorMessage: z.string().nullable(),
  renderedAt: z.string().datetime().nullable(),
});

export type ProjectRenderItem = z.infer<typeof projectRenderItemSchema>;

export const projectRenderListResponseSchema = z.object({
  projectPublicId: z.string().uuid(),
  items: z.array(projectRenderItemSchema),
});

export type ProjectRenderListResponse = z.infer<
  typeof projectRenderListResponseSchema
>;

export const renderStatusResponseSchema = z.object({
  ffmpegAvailable: z.boolean(),
  ffmpegPath: z.string().nullable(),
  remotionEntry: z.string(),
  error: z.string().optional(),
});

export type RenderStatusResponse = z.infer<typeof renderStatusResponseSchema>;