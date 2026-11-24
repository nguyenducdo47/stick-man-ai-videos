import { z } from 'zod';

import { ACTION_ID_LIST } from './actions.js';
import { ENVIRONMENT_ID_LIST } from './environments.js';
import { stickmanStyleSchema } from './scene-graph.js';
import {
  actionClipSchema,
  cameraKeyframeSchema,
  interactionSchema,
} from './scene-timeline.js';

export { actionClipSchema, type ActionClip } from './scene-timeline.js';

export const sceneGraphV2SceneSchema = z.object({
  scenePublicId: z.string().uuid(),
  sortOrder: z.number().int().min(0),
  title: z.string().nullable(),
  durationSec: z.number().positive().max(600),
  animationPreset: z.string().max(100),
  cameraPreset: z.string().max(100),
  environmentId: z.enum(ENVIRONMENT_ID_LIST),
  description: z.string().nullable().optional(),
  characterAction: z.string().nullable().optional(),
  actionClips: z.array(actionClipSchema).min(1).max(32),
  interactions: z.array(interactionSchema).max(16).optional().default([]),
  cameraKeyframes: z.array(cameraKeyframeSchema).min(1).max(24).optional(),
  subtitleText: z.string().max(5000).nullable().optional(),
  timeline: z.object({
    animationId: z.string(),
    cameraId: z.string(),
    easing: z.enum(['linear', 'ease-in-out']).default('ease-in-out'),
  }),
});

export const sceneGraphV2DocumentSchema = z.object({
  version: z.literal(2),
  projectPublicId: z.string().uuid(),
  visualStyle: z.string(),
  character: stickmanStyleSchema,
  scenes: z.array(sceneGraphV2SceneSchema).min(0).max(50),
  totalDurationSec: z.number().nonnegative(),
  compiledAt: z.string().datetime(),
});

export type SceneGraphV2Document = z.infer<typeof sceneGraphV2DocumentSchema>;

export const sceneGraphV2ResponseSchema = z.object({
  projectPublicId: z.string().uuid(),
  graph: sceneGraphV2DocumentSchema,
  savedPath: z.string().nullable(),
  /** v1 graph always included for backward compatibility */
  v1SavedPath: z.string().nullable(),
});

export type SceneGraphV2Response = z.infer<typeof sceneGraphV2ResponseSchema>;