import {
  sceneGraphDocumentSchema,
  type SceneGraphDocument,
} from '@ai-video-studio/validation';

import {
  resolveAnimationPreset,
  resolveCameraPreset,
  type AnimationPresetId,
  type CameraPresetId,
} from './presets.js';

export interface SceneGraphSourceScene {
  publicId: string;
  sortOrder: number;
  title: string | null;
  description: string | null;
  characterAction: string | null;
  animationPreset: string | null;
  cameraPreset: string | null;
  durationSec: number | null;
  config?: unknown;
}

export interface BuildSceneGraphInput {
  projectPublicId: string;
  visualStyle: string | null;
  scenes: SceneGraphSourceScene[];
  compiledAt?: string;
}

const DEFAULT_SCENE_DURATION = 8;

export function buildSceneGraph(input: BuildSceneGraphInput): SceneGraphDocument {
  const compiledAt = input.compiledAt ?? new Date().toISOString();
  const visualStyle = input.visualStyle?.trim() || 'stickman-red-hoodie';

  const scenes = [...input.scenes]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((scene) => {
      const animationId: AnimationPresetId = resolveAnimationPreset(
        scene.animationPreset,
      );
      const cameraId: CameraPresetId = resolveCameraPreset(scene.cameraPreset);
      const durationSec = scene.durationSec ?? DEFAULT_SCENE_DURATION;

      return {
        scenePublicId: scene.publicId,
        sortOrder: scene.sortOrder,
        title: scene.title,
        durationSec,
        animationPreset: animationId,
        cameraPreset: cameraId,
        description: scene.description,
        characterAction: scene.characterAction,
        timeline: {
          animationId,
          cameraId,
          easing: 'ease-in-out' as const,
        },
      };
    });

  const totalDurationSec = scenes.reduce((sum, s) => sum + s.durationSec, 0);

  const document = {
    version: 1 as const,
    projectPublicId: input.projectPublicId,
    visualStyle,
    character: {
      style: 'stickman-red-hoodie' as const,
      colors: {
        body: '#f5f5f5',
        hoodie: '#dc2626',
        shoes: '#171717',
      },
    },
    scenes,
    totalDurationSec,
    compiledAt,
  };

  return sceneGraphDocumentSchema.parse(document);
}