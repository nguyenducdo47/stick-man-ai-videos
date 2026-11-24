export const DEFAULT_ANIMATION_PRESET = 'idle' as const;
export const DEFAULT_CAMERA_PRESET = 'wide-shot' as const;

export const ANIMATION_PRESET_IDS = [
  'idle',
  'walk',
  'point',
  'wave',
  'sit',
] as const;

export const CAMERA_PRESET_IDS = [
  'wide-shot',
  'medium-shot',
  'close-up',
  'zoom-in',
  'tracking',
] as const;

export type AnimationPresetId = (typeof ANIMATION_PRESET_IDS)[number];
export type CameraPresetId = (typeof CAMERA_PRESET_IDS)[number];

export interface AnimationPresetDef {
  id: AnimationPresetId;
  label: string;
  /** Degrees — simplified joint hints for preview/renderer. */
  armSwingDeg: number;
  legSwingDeg: number;
  torsoLeanDeg: number;
  loop: boolean;
}

export interface CameraPresetDef {
  id: CameraPresetId;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export const ANIMATION_PRESETS: Record<AnimationPresetId, AnimationPresetDef> = {
  idle: {
    id: 'idle',
    label: 'Idle',
    armSwingDeg: 0,
    legSwingDeg: 0,
    torsoLeanDeg: 0,
    loop: true,
  },
  walk: {
    id: 'walk',
    label: 'Walk',
    armSwingDeg: 25,
    legSwingDeg: 35,
    torsoLeanDeg: 5,
    loop: true,
  },
  point: {
    id: 'point',
    label: 'Point',
    armSwingDeg: 55,
    legSwingDeg: 0,
    torsoLeanDeg: 8,
    loop: false,
  },
  wave: {
    id: 'wave',
    label: 'Wave',
    armSwingDeg: 40,
    legSwingDeg: 0,
    torsoLeanDeg: 0,
    loop: true,
  },
  sit: {
    id: 'sit',
    label: 'Sit',
    armSwingDeg: 10,
    legSwingDeg: -45,
    torsoLeanDeg: -12,
    loop: true,
  },
};

export const CAMERA_PRESETS: Record<CameraPresetId, CameraPresetDef> = {
  'wide-shot': {
    id: 'wide-shot',
    label: 'Wide shot',
    position: [0, 1.2, 6],
    target: [0, 0.9, 0],
    fov: 50,
  },
  'medium-shot': {
    id: 'medium-shot',
    label: 'Medium shot',
    position: [0, 1.1, 4],
    target: [0, 1, 0],
    fov: 45,
  },
  'close-up': {
    id: 'close-up',
    label: 'Close-up',
    position: [0, 1.4, 2.2],
    target: [0, 1.35, 0],
    fov: 40,
  },
  'zoom-in': {
    id: 'zoom-in',
    label: 'Zoom in',
    position: [0, 1.2, 3],
    target: [0, 1, 0],
    fov: 35,
  },
  tracking: {
    id: 'tracking',
    label: 'Tracking',
    position: [2.5, 1.2, 4],
    target: [0, 1, 0],
    fov: 48,
  },
};

export function resolveAnimationPreset(
  raw: string | null | undefined,
): AnimationPresetId {
  const key = (raw ?? '').trim().toLowerCase();
  if ((ANIMATION_PRESET_IDS as readonly string[]).includes(key)) {
    return key as AnimationPresetId;
  }
  return DEFAULT_ANIMATION_PRESET;
}

export function resolveCameraPreset(raw: string | null | undefined): CameraPresetId {
  const key = (raw ?? '').trim().toLowerCase();
  if ((CAMERA_PRESET_IDS as readonly string[]).includes(key)) {
    return key as CameraPresetId;
  }
  return DEFAULT_CAMERA_PRESET;
}