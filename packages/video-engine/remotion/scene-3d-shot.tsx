import { ThreeCanvas } from '@remotion/three';
import type {
  ActionClip,
  CameraKeyframe,
  EnvironmentId,
  Interaction,
} from '@ai-video-studio/validation';
import { StickmanSceneBody } from '@ai-video-studio/stickman-renderer';
import React from 'react';
import { staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

import type { StickmanColors } from './types';

function resolveGlbFetchUrl(src: string | null | undefined): string | null {
  if (!src) return null;
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  return staticFile(src);
}

export function Scene3DShot({
  animationPreset,
  cameraPreset,
  characterColors,
  environmentId,
  actionClips,
  interactions,
  cameraKeyframes,
  heroGlbSrc,
  environmentGlbSrc,
  sceneLocalTimeSec,
}: {
  animationPreset: string;
  cameraPreset: string;
  characterColors: StickmanColors;
  environmentId: EnvironmentId;
  actionClips: ActionClip[];
  interactions?: Interaction[];
  cameraKeyframes?: CameraKeyframe[];
  heroGlbSrc?: string | null;
  environmentGlbSrc?: string | null;
  /** Offset within the scene sequence (for Series sub-composition). */
  sceneLocalTimeSec?: number;
}) {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeSec =
    sceneLocalTimeSec !== undefined ? sceneLocalTimeSec + frame / fps : frame / fps;

  return (
    <ThreeCanvas width={width} height={Math.round(height * 0.72)} linear>
      <StickmanSceneBody
        environmentId={environmentId}
        cameraPreset={cameraPreset}
        colors={characterColors}
        timeSec={timeSec}
        actionClips={actionClips}
        interactions={interactions}
        cameraKeyframes={cameraKeyframes}
        heroGlbUrl={resolveGlbFetchUrl(heroGlbSrc)}
        environmentGlbUrl={resolveGlbFetchUrl(environmentGlbSrc)}
      />
    </ThreeCanvas>
  );
}