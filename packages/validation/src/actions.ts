import { z } from 'zod';

/** Canonical character action ids — AI and UI must pick from this list. */
export const ACTION_ID_LIST = [
  'idle',
  'walk',
  'run',
  'jump',
  'sit',
  'stand_up',
  'wave',
  'point',
  'talk',
  'explain',
  'think',
  'look_around',
  'turn',
  'pick_up',
  'put_down',
  'push',
  'pull',
  'open_door',
  'close_door',
  'climb',
  'fall',
  'celebrate',
  'shake_hands',
] as const;

export const actionIdSchema = z.enum(ACTION_ID_LIST);

export type ActionId = z.infer<typeof actionIdSchema>;

/** Legacy Phase 3 animationPreset → default v2 action. */
export const LEGACY_PRESET_TO_ACTION: Record<string, ActionId> = {
  idle: 'idle',
  walk: 'walk',
  point: 'point',
  wave: 'wave',
  sit: 'sit',
};