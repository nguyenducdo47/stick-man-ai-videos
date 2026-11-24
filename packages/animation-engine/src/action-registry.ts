import {
  ACTION_ID_LIST,
  type ActionId,
  LEGACY_PRESET_TO_ACTION,
} from '@ai-video-studio/validation';

import { GLTF_CLIP_BY_ACTION } from './gltf-action-map.js';

export type ActionImplementation = 'procedural' | 'gltf_clip';

export interface ActionDefinition {
  id: ActionId;
  label: string;
  implementation: ActionImplementation;
  /** GLB clip name when implementation is gltf_clip */
  gltfClipName?: string;
  loops: boolean;
}

const definitions: Record<ActionId, ActionDefinition> = {
  idle: { id: 'idle', label: 'Idle', implementation: 'procedural', loops: true },
  walk: { id: 'walk', label: 'Walk', implementation: 'procedural', loops: true },
  run: { id: 'run', label: 'Run', implementation: 'procedural', loops: true },
  jump: { id: 'jump', label: 'Jump', implementation: 'procedural', loops: false },
  sit: { id: 'sit', label: 'Sit', implementation: 'procedural', loops: true },
  stand_up: {
    id: 'stand_up',
    label: 'Stand up',
    implementation: 'procedural',
    loops: false,
  },
  wave: { id: 'wave', label: 'Wave', implementation: 'procedural', loops: true },
  point: { id: 'point', label: 'Point', implementation: 'procedural', loops: false },
  talk: { id: 'talk', label: 'Talk', implementation: 'procedural', loops: true },
  explain: {
    id: 'explain',
    label: 'Explain',
    implementation: 'procedural',
    loops: true,
  },
  think: { id: 'think', label: 'Think', implementation: 'procedural', loops: true },
  look_around: {
    id: 'look_around',
    label: 'Look around',
    implementation: 'procedural',
    loops: true,
  },
  turn: { id: 'turn', label: 'Turn', implementation: 'procedural', loops: false },
  pick_up: {
    id: 'pick_up',
    label: 'Pick up',
    implementation: 'procedural',
    loops: false,
  },
  put_down: {
    id: 'put_down',
    label: 'Put down',
    implementation: 'procedural',
    loops: false,
  },
  push: { id: 'push', label: 'Push', implementation: 'procedural', loops: true },
  pull: { id: 'pull', label: 'Pull', implementation: 'procedural', loops: true },
  open_door: {
    id: 'open_door',
    label: 'Open door',
    implementation: 'procedural',
    loops: false,
  },
  close_door: {
    id: 'close_door',
    label: 'Close door',
    implementation: 'procedural',
    loops: false,
  },
  climb: { id: 'climb', label: 'Climb', implementation: 'procedural', loops: true },
  fall: { id: 'fall', label: 'Fall', implementation: 'procedural', loops: false },
  celebrate: {
    id: 'celebrate',
    label: 'Celebrate',
    implementation: 'procedural',
    loops: true,
  },
  shake_hands: {
    id: 'shake_hands',
    label: 'Shake hands',
    implementation: 'procedural',
    loops: false,
  },
};

for (const id of ACTION_ID_LIST) {
  const clip = GLTF_CLIP_BY_ACTION[id];
  if (clip) {
    definitions[id] = {
      ...definitions[id],
      implementation: 'gltf_clip',
      gltfClipName: clip,
    };
  }
}

export const ACTION_REGISTRY: Record<ActionId, ActionDefinition> = definitions;

export const ACTION_REGISTRY_LIST = ACTION_ID_LIST.map((id) => definitions[id]);

export function resolveActionId(raw: string | null | undefined): ActionId {
  const key = (raw ?? '').trim().toLowerCase();
  if ((ACTION_ID_LIST as readonly string[]).includes(key)) {
    return key as ActionId;
  }
  const legacy = LEGACY_PRESET_TO_ACTION[key];
  if (legacy) return legacy;
  return 'idle';
}

export function isGltfClipAction(id: ActionId): boolean {
  return ACTION_REGISTRY[id].implementation === 'gltf_clip';
}