import type {
  ActionClip,
  CameraKeyframe,
  EnvironmentId,
  Interaction,
} from '@ai-video-studio/validation';

export type StickmanColors = {
  body: string;
  hoodie: string;
  shoes: string;
};

export type RemotionSceneClip = {
  scenePublicId: string;
  sortOrder: number;
  title: string | null;
  durationSec: number;
  audioSrc: string;
  animationPreset: string;
  cameraPreset: string;
  characterColors: StickmanColors;
  environmentId: EnvironmentId;
  actionClips: ActionClip[];
  interactions?: Interaction[];
  cameraKeyframes?: CameraKeyframe[];
  subtitleText?: string | null;
  heroGlbSrc?: string | null;
  environmentGlbSrc?: string | null;
};

export type RemotionProjectVideoProps = {
  projectTitle: string;
  fps: number;
  scenes: RemotionSceneClip[];
};