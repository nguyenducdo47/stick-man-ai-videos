import { z } from 'zod';

import { SUPPORTED_LOCALES } from '@ai-video-studio/shared';

const localeSchema = z.enum(SUPPORTED_LOCALES);

export const createProjectSchema = z.object({
  title: z.string().min(1).max(200),
  topic: z.string().min(1).max(2000),
  targetDurationSec: z.number().int().positive().max(3600).optional(),
  targetSceneCount: z.number().int().min(1).max(50).optional(),
  languages: z.array(localeSchema).min(1).max(2),
  visualStyle: z.string().max(100).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial().extend({
  scriptDraft: z.string().max(500_000).optional(),
  status: z.enum(['DRAFT', 'SCRIPTING', 'STORYBOARD', 'READY']).optional(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const projectPublicParamsSchema = z.object({
  publicId: z.string().uuid(),
});

export const projectResponseSchema = z.object({
  publicId: z.string().uuid(),
  title: z.string(),
  topic: z.string(),
  targetDurationSec: z.number().int().nullable(),
  targetSceneCount: z.number().int().nullable(),
  languages: z.array(localeSchema),
  visualStyle: z.string().nullable(),
  scriptDraft: z.string().nullable(),
  status: z.enum(['DRAFT', 'SCRIPTING', 'STORYBOARD', 'READY']),
  sceneCount: z.number().int(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ProjectResponse = z.infer<typeof projectResponseSchema>;

export const projectListResponseSchema = z.object({
  items: z.array(projectResponseSchema),
  total: z.number().int(),
});

export type ProjectListResponse = z.infer<typeof projectListResponseSchema>;