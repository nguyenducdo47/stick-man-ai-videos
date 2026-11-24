import type { CameraKeyframe } from '@ai-video-studio/validation';

import {
  CAMERA_PRESETS,
  resolveCameraPreset,
  type CameraPresetDef,
} from './presets.js';

export type SampledCamera = Pick<
  CameraPresetDef,
  'position' | 'target' | 'fov'
>;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpTuple(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

export function defaultCameraKeyframes(
  cameraPreset: string,
  durationSec: number,
): CameraKeyframe[] {
  const def = CAMERA_PRESETS[resolveCameraPreset(cameraPreset)];
  const tracking = CAMERA_PRESETS.tracking;
  if (resolveCameraPreset(cameraPreset) === 'tracking') {
    return [
      {
        timeSec: 0,
        position: tracking.position,
        target: tracking.target,
        fov: tracking.fov,
      },
      {
        timeSec: durationSec,
        position: [tracking.position[0] + 1.5, tracking.position[1], tracking.position[2] - 1],
        target: tracking.target,
        fov: tracking.fov,
      },
    ];
  }
  return [
    {
      timeSec: 0,
      position: def.position,
      target: def.target,
      fov: def.fov,
    },
    {
      timeSec: Math.max(durationSec, 0.1),
      position: def.position,
      target: def.target,
      fov: def.fov,
    },
  ];
}

export function sampleCameraAtTime(
  keyframes: CameraKeyframe[] | undefined,
  cameraPreset: string,
  timeSec: number,
): SampledCamera {
  const fallback = CAMERA_PRESETS[resolveCameraPreset(cameraPreset)];
  const sorted = [...(keyframes ?? defaultCameraKeyframes(cameraPreset, 1))].sort(
    (a, b) => a.timeSec - b.timeSec,
  );
  if (sorted.length === 0) {
    return { position: fallback.position, target: fallback.target, fov: fallback.fov };
  }
  if (timeSec <= sorted[0]!.timeSec) {
    const k = sorted[0]!;
    return { position: k.position, target: k.target, fov: k.fov };
  }
  const last = sorted[sorted.length - 1]!;
  if (timeSec >= last.timeSec) {
    return { position: last.position, target: last.target, fov: last.fov };
  }
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i]!;
    const b = sorted[i + 1]!;
    if (timeSec >= a.timeSec && timeSec <= b.timeSec) {
      const span = b.timeSec - a.timeSec || 1;
      const t = (timeSec - a.timeSec) / span;
      return {
        position: lerpTuple(a.position, b.position, t),
        target: lerpTuple(a.target, b.target, t),
        fov: lerp(a.fov, b.fov, t),
      };
    }
  }
  return { position: fallback.position, target: fallback.target, fov: fallback.fov };
}