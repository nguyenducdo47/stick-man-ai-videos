import { ENVIRONMENT_PRESETS } from '@ai-video-studio/animation-engine';
import type { ActionId, CameraKeyframe, EnvironmentId, Interaction } from '@ai-video-studio/validation';
import React from 'react';

import { EnvironmentGround, EnvironmentProps } from './environment-props.js';
import { HeroGlbCharacter } from './hero-glb-character.js';
import type { StickmanColors } from './procedural-pose.js';
import { SceneDefaultCamera } from './scene-default-camera.js';

export type StickmanSceneProps = {
  environmentId: EnvironmentId;
  cameraPreset: string;
  colors: StickmanColors;
  timeSec: number;
  actionId?: ActionId;
  actionClips?: { actionId: ActionId; startSec: number; durationSec: number }[];
  interactions?: Interaction[];
  cameraKeyframes?: CameraKeyframe[];
  heroGlbUrl?: string | null;
  environmentGlbUrl?: string | null;
};

export function StickmanSceneBody({
  environmentId,
  cameraPreset,
  colors,
  timeSec,
  actionId,
  actionClips,
  interactions,
  cameraKeyframes,
  heroGlbUrl,
  environmentGlbUrl,
}: StickmanSceneProps) {
  const lighting = ENVIRONMENT_PRESETS[environmentId].lighting;
  const [sx, sy, sz] = lighting.sunPosition;
  return (
    <>
      <EnvironmentGround environmentId={environmentId} />
      <ambientLight intensity={lighting.ambient} />
      <hemisphereLight
        color={lighting.hemisphereSky}
        groundColor={lighting.hemisphereGround}
        intensity={lighting.hemisphereIntensity}
      />
      <directionalLight position={[sx, sy, sz]} intensity={lighting.sunIntensity} castShadow />
      <SceneDefaultCamera
        cameraPreset={cameraPreset}
        cameraKeyframes={cameraKeyframes}
        timeSec={timeSec}
      />
      <EnvironmentProps
        environmentId={environmentId}
        environmentGlbUrl={environmentGlbUrl ?? null}
      />
      <HeroGlbCharacter
        glbUrl={heroGlbUrl ?? null}
        colors={colors}
        actionId={actionId}
        actionClips={actionClips}
        interactions={interactions}
        timeSec={timeSec}
      />
    </>
  );
}