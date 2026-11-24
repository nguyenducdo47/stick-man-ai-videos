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

export {
  ACTION_REGISTRY,
  ACTION_REGISTRY_LIST,
  resolveActionId,
  isGltfClipAction,
  type ActionDefinition,
} from './action-registry.js';

export {
  ENVIRONMENT_PRESETS,
  resolveEnvironmentId,
  type EnvironmentGlbTransform,
  type EnvironmentPresetDef,
} from './environment-presets.js';

export {
  GLTF_CLIP_BY_ACTION,
  gltfClipNamesForActions,
  resolveGltfClipName,
} from './gltf-action-map.js';

export {
  buildSceneGraphV2,
  defaultActionClipsForScene,
} from './build-scene-graph-v2.js';

export {
  sampleCameraAtTime,
  defaultCameraKeyframes,
  type SampledCamera,
} from './camera-keyframes.js';

export {
  sampleInteractionOffsets,
  type InteractionOffsets,
} from './interaction-runtime.js';