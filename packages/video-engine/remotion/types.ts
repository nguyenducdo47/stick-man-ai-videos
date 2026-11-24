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
};

export type RemotionProjectVideoProps = {
  projectTitle: string;
  fps: number;
  scenes: RemotionSceneClip[];
};