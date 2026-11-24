import { z } from 'zod';

import {
  ACTION_ID_LIST,
  LEGACY_PRESET_TO_ACTION,
  actionIdSchema,
  type ActionId,
} from './actions.js';
import { CAMERA_PRESET_ID_LIST } from './cameras.js';
import { ENVIRONMENT_ID_LIST } from './environments.js';

export const aiScriptOutputSchema = z.object({
  script: z.string().min(20).max(500_000),
  synopsis: z.string().max(2000).optional(),
});

export type AiScriptOutput = z.infer<typeof aiScriptOutputSchema>;

function normalizeActionId(raw: unknown): ActionId {
  const key = String(raw ?? 'idle')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
  if ((ACTION_ID_LIST as readonly string[]).includes(key)) {
    return key as ActionId;
  }
  return LEGACY_PRESET_TO_ACTION[key] ?? 'idle';
}

function normalizeEnvironmentId(raw: unknown): (typeof ENVIRONMENT_ID_LIST)[number] {
  const key = String(raw ?? 'studio_grid').trim();
  if ((ENVIRONMENT_ID_LIST as readonly string[]).includes(key)) {
    return key as (typeof ENVIRONMENT_ID_LIST)[number];
  }
  return 'studio_grid';
}

function normalizeCameraId(raw: unknown): (typeof CAMERA_PRESET_ID_LIST)[number] {
  const key = String(raw ?? 'wide-shot').trim().toLowerCase();
  if ((CAMERA_PRESET_ID_LIST as readonly string[]).includes(key)) {
    return key as (typeof CAMERA_PRESET_ID_LIST)[number];
  }
  return 'wide-shot';
}

export const aiStoryboardSceneSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  characterAction: z.string().max(2000).optional(),
  animationPreset: z.custom<ActionId>((v) => normalizeActionId(v)),
  cameraPreset: z.custom<(typeof CAMERA_PRESET_ID_LIST)[number]>((v) =>
    normalizeCameraId(v),
  ),
  environmentId: z
    .custom<(typeof ENVIRONMENT_ID_LIST)[number]>((v) =>
      normalizeEnvironmentId(v ?? 'studio_grid'),
    ),
  durationSec: z.number().positive().max(600).optional(),
  narrationVi: z.string().min(1).max(10_000),
  narrationEn: z.string().min(1).max(10_000),
});

export const aiStoryboardOutputSchema = z.object({
  scenes: z.array(aiStoryboardSceneSchema).min(1).max(50),
});

export type AiStoryboardOutput = z.infer<typeof aiStoryboardOutputSchema>;

export const aiGenerateOptionsSchema = z.object({
  model: z.string().max(100).optional(),
  temperature: z.number().min(0).max(1).optional(),
});

export type AiGenerateOptions = z.infer<typeof aiGenerateOptionsSchema>;