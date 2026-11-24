import { z } from 'zod';

import { SUPPORTED_LOCALES } from '@ai-video-studio/shared';

const localeSchema = z.enum(SUPPORTED_LOCALES);

const korvaVoiceIdSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z][a-z0-9_]*$/);

export const ttsSynthesizeRequestSchema = z.object({
  text: z.string().min(1).max(10_000),
  locale: localeSchema,
  voice: korvaVoiceIdSchema.optional(),
});

export type TtsSynthesizeRequest = z.infer<typeof ttsSynthesizeRequestSchema>;

export const ttsHealthResponseSchema = z.object({
  status: z.literal('ok'),
  engine: z.string(),
  detail: z.string().optional(),
  vietnameseVoiceAvailable: z.boolean().optional(),
  korvaVoices: z.array(z.string()).optional(),
  korvaDefaultViVoice: z.string().optional(),
  korvaStudioVoiceVi: z.string().optional(),
  korvaEnvVoiceVi: z.string().optional(),
  korvaLoadError: z.string().optional(),
  voices: z
    .array(z.object({ id: z.string(), name: z.string() }))
    .optional(),
});

export type TtsHealthResponse = z.infer<typeof ttsHealthResponseSchema>;

export const ttsStatusResponseSchema = z.object({
  reachable: z.boolean(),
  engine: z.string().optional(),
  detail: z.string().optional(),
  vietnameseVoiceAvailable: z.boolean().optional(),
  korvaVoices: z.array(z.string()).optional(),
  korvaVoiceVi: z.string().optional(),
  korvaDefaultViVoice: z.string().optional(),
  error: z.string().optional(),
  serviceUrl: z.string(),
});

export type TtsStatusResponse = z.infer<typeof ttsStatusResponseSchema>;

export const updateTtsPreferencesSchema = z.object({
  korvaVoiceVi: korvaVoiceIdSchema,
});

export type UpdateTtsPreferencesInput = z.infer<typeof updateTtsPreferencesSchema>;

export const ttsPreferencesResponseSchema = z.object({
  korvaVoiceVi: z.string(),
  korvaVoices: z.array(z.string()).optional(),
});

export type TtsPreferencesResponse = z.infer<typeof ttsPreferencesResponseSchema>;

export const DEFAULT_TTS_PREVIEW_VI_TEXT =
  'Xin chào, đây là giọng đọc Korva trong AI Video Studio.';

export const ttsPreviewRequestSchema = z.object({
  korvaVoiceVi: korvaVoiceIdSchema.optional(),
  text: z.string().min(1).max(500).optional(),
});

export type TtsPreviewRequest = z.infer<typeof ttsPreviewRequestSchema>;

export const sceneTtsResponseSchema = z.object({
  scenePublicId: z.string().uuid(),
  locale: localeSchema,
  audioPath: z.string(),
  audioUrl: z.string(),
  skipped: z.literal(false),
  korvaVoiceVi: z.string().optional(),
});

export type SceneTtsResponse = z.infer<typeof sceneTtsResponseSchema>;

export const projectTtsBatchResponseSchema = z.object({
  projectPublicId: z.string().uuid(),
  generated: z.number().int().min(0),
  skipped: z.number().int().min(0),
  results: z.array(sceneTtsResponseSchema),
  failures: z.array(
    z.object({
      scenePublicId: z.string().uuid(),
      locale: localeSchema,
      error: z.string(),
    }),
  ),
});

export type ProjectTtsBatchResponse = z.infer<typeof projectTtsBatchResponseSchema>;