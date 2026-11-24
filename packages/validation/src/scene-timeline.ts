import { z } from 'zod';

import { ACTION_ID_LIST } from './actions.js';
import { ENVIRONMENT_ID_LIST } from './environments.js';

export const actionClipSchema = z.object({
  actionId: z.enum(ACTION_ID_LIST),
  startSec: z.number().min(0),
  durationSec: z.number().positive(),
  blendSec: z.number().min(0).max(2).default(0.25),
  targetPosition: z.tuple([z.number(), z.number(), z.number()]).optional(),
  targetObjectId: z.string().max(64).optional(),
});

export type ActionClip = z.infer<typeof actionClipSchema>;

export const INTERACTION_TYPES = ['walk_to', 'sit_on', 'look_at'] as const;

export const interactionSchema = z.object({
  id: z.string().max(64),
  type: z.enum(INTERACTION_TYPES),
  startSec: z.number().min(0),
  durationSec: z.number().positive().max(120),
  targetPosition: z.tuple([z.number(), z.number(), z.number()]).optional(),
  targetObjectId: z.string().max(64).optional(),
});

export type Interaction = z.infer<typeof interactionSchema>;

export const cameraKeyframeSchema = z.object({
  timeSec: z.number().min(0),
  position: z.tuple([z.number(), z.number(), z.number()]),
  target: z.tuple([z.number(), z.number(), z.number()]),
  fov: z.number().min(12).max(100),
});

export type CameraKeyframe = z.infer<typeof cameraKeyframeSchema>;

export const sceneConfigSchema = z.object({
  environmentId: z.enum(ENVIRONMENT_ID_LIST).optional(),
  actionClips: z.array(actionClipSchema).min(1).max(32).optional(),
  interactions: z.array(interactionSchema).max(16).optional(),
  cameraKeyframes: z.array(cameraKeyframeSchema).min(1).max(24).optional(),
});

export type SceneConfig = z.infer<typeof sceneConfigSchema>;

export const sceneTimelinePatchSchema = z.object({
  actionClips: z.array(actionClipSchema).min(1).max(32).optional(),
  interactions: z.array(interactionSchema).max(16).optional(),
  cameraKeyframes: z.array(cameraKeyframeSchema).min(1).max(24).optional(),
  environmentId: z.enum(ENVIRONMENT_ID_LIST).optional(),
});

export type SceneTimelinePatch = z.infer<typeof sceneTimelinePatchSchema>;

export const sceneTimelineResponseSchema = z.object({
  scenePublicId: z.string().uuid(),
  durationSec: z.number().nullable(),
  config: sceneConfigSchema,
});

export type SceneTimelineResponse = z.infer<typeof sceneTimelineResponseSchema>;