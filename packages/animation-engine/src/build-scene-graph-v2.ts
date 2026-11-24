import {
  sceneGraphV2DocumentSchema,
  sceneConfigSchema,
  type ActionClip,
  type SceneGraphV2Document,
  type SceneConfig,
  type CameraKeyframe,
  type Interaction,
} from '@ai-video-studio/validation';

import { resolveActionId } from './action-registry.js';
import { defaultCameraKeyframes } from './camera-keyframes.js';
import { resolveEnvironmentId } from './environment-presets.js';
import {
  resolveAnimationPreset,
  resolveCameraPreset,
} from './presets.js';
import type { BuildSceneGraphInput } from './build-scene-graph.js';
import { buildSceneGraph } from './build-scene-graph.js';

function parseSceneConfig(raw: unknown): SceneConfig {
  const parsed = sceneConfigSchema.safeParse(raw ?? {});
  return parsed.success ? parsed.data : {};
}

export function defaultActionClipsForScene(
  durationSec: number,
  animationPreset: string | null | undefined,
): ActionClip[] {
  const animationId = resolveAnimationPreset(animationPreset);
  const actionId = resolveActionId(animationId);
  return [
    {
      actionId,
      startSec: 0,
      durationSec,
      blendSec: 0.25,
    },
  ];
}

export function buildSceneGraphV2(
  input: BuildSceneGraphInput,
  options?: {
    environmentId?: string | null;
    compiledAt?: string;
  },
): SceneGraphV2Document {
  const v1 = buildSceneGraph(input);
  const compiledAt = options?.compiledAt ?? v1.compiledAt;
  const defaultEnv = resolveEnvironmentId(options?.environmentId);

  const scenes = [...input.scenes]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((scene) => {
      const animationId = resolveAnimationPreset(scene.animationPreset);
      const cameraId = resolveCameraPreset(scene.cameraPreset);
      const durationSec = scene.durationSec ?? 8;
      const cfg = parseSceneConfig(scene.config);

      const environmentId = resolveEnvironmentId(
        cfg.environmentId ?? defaultEnv,
      );

      const actionClips =
        cfg.actionClips && cfg.actionClips.length > 0
          ? cfg.actionClips
          : defaultActionClipsForScene(durationSec, scene.animationPreset);

      const interactions: Interaction[] = cfg.interactions ?? [];
      const cameraKeyframes: CameraKeyframe[] | undefined =
        cfg.cameraKeyframes && cfg.cameraKeyframes.length > 0
          ? cfg.cameraKeyframes
          : defaultCameraKeyframes(cameraId, durationSec);

      return {
        scenePublicId: scene.publicId,
        sortOrder: scene.sortOrder,
        title: scene.title,
        durationSec,
        animationPreset: animationId,
        cameraPreset: cameraId,
        environmentId,
        description: scene.description,
        characterAction: scene.characterAction,
        actionClips,
        interactions,
        cameraKeyframes,
        subtitleText: null,
        timeline: {
          animationId,
          cameraId,
          easing: 'ease-in-out' as const,
        },
      };
    });

  const document = {
    version: 2 as const,
    projectPublicId: input.projectPublicId,
    visualStyle: v1.visualStyle,
    character: v1.character,
    scenes,
    totalDurationSec: scenes.reduce((sum, s) => sum + s.durationSec, 0),
    compiledAt,
  };

  return sceneGraphV2DocumentSchema.parse(document);
}

export type { BuildSceneGraphInput };