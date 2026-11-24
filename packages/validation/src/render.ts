import { z } from 'zod';

import { SUPPORTED_LOCALES } from '@ai-video-studio/shared';

import { actionClipSchema } from './scene-graph-v2.js';
import { environmentIdSchema } from './environments.js';
import {
  cameraKeyframeSchema,
  interactionSchema,
} from './scene-timeline.js';

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
  environmentId: environmentIdSchema,
  actionClips: z.array(actionClipSchema).min(1),
  interactions: z.array(interactionSchema).max(16).optional(),
  cameraKeyframes: z.array(cameraKeyframeSchema).min(1).max(24).optional(),
  subtitleText: z.string().nullable().optional(),
  /** HTTP URL (web preview) or Remotion `staticFile` path e.g. `environments/park.glb`. */
  heroGlbSrc: z
    .string()
    .min(1)
    .refine((s) => s.startsWith('http') || /^[\w./-]+\.glb$/i.test(s), {
      message: 'Must be http(s) URL or relative .glb path',
    })
    .nullable()
    .optional(),
  environmentGlbSrc: z
    .string()
    .min(1)
    .refine((s) => s.startsWith('http') || /^[\w./-]+\.glb$/i.test(s), {
      message: 'Must be http(s) URL or relative .glb path',
    })
    .nullable()
    .optional(),
});

export type RenderClip = z.infer<typeof renderClipSchema>;

export const RENDER_QUALITY_MODES = ['preview', 'standard', 'high', 'hq'] as const;

export const projectRenderRequestSchema = z.object({
  locale: localeSchema,
  async: z.boolean().optional(),
  quality: z.enum(RENDER_QUALITY_MODES).optional(),
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

export const renderJobResponseSchema = z.object({
  jobId: z.string(),
  status: z.enum(['queued', 'active', 'completed', 'failed', 'cancelled']),
  projectPublicId: z.string().uuid(),
  locale: localeSchema,
  progress: z.number().min(0).max(100).optional(),
  errorMessage: z.string().nullable().optional(),
});

export type RenderJobResponse = z.infer<typeof renderJobResponseSchema>;