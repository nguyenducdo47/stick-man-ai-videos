/** Phase 3 — Three.js stickman scene graph (data layer; rendering in web / Remotion). */
export {
  ANIMATION_PRESETS,
  ANIMATION_PRESET_IDS,
  CAMERA_PRESETS,
  CAMERA_PRESET_IDS,
  DEFAULT_ANIMATION_PRESET,
  DEFAULT_CAMERA_PRESET,
  resolveAnimationPreset,
  resolveCameraPreset,
  type AnimationPresetDef,
  type AnimationPresetId,
  type CameraPresetDef,
  type CameraPresetId,
} from './presets.js';

export {
  buildSceneGraph,
  type BuildSceneGraphInput,
  type SceneGraphSourceScene,
} from './build-scene-graph.js';