import type { ActionId } from '@ai-video-studio/validation';

/**
 * Default clip names inside CC0 hero rigs (Mixamo / Quaternius).
 * Override via `data/studio/gltf-action-map.v1.json` — keep in sync when editing that file.
 */
export const GLTF_CLIP_BY_ACTION: Partial<Record<ActionId, string>> = {
  idle: 'Idle',
  walk: 'Walking',
  run: 'Running',
  sit: 'Sitting',
  wave: 'Waving',
  talk: 'Talking',
  point: 'Pointing',
  jump: 'Jumping',
  stand_up: 'Stand Up',
  celebrate: 'Cheering',
};

export function resolveGltfClipName(actionId: ActionId): string {
  return GLTF_CLIP_BY_ACTION[actionId] ?? actionId;
}

export function gltfClipNamesForActions(actionIds: ActionId[]): string[] {
  return actionIds.map((id) => resolveGltfClipName(id));
}