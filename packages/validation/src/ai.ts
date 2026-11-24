import { z } from 'zod';

export const aiScriptOutputSchema = z.object({
  script: z.string().min(20).max(500_000),
  synopsis: z.string().max(2000).optional(),
});

export type AiScriptOutput = z.infer<typeof aiScriptOutputSchema>;

export const aiStoryboardSceneSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  characterAction: z.string().max(2000).optional(),
  animationPreset: z.string().max(100).optional(),
  cameraPreset: z.string().max(100).optional(),
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