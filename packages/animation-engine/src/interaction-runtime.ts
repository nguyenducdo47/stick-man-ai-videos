import type { Interaction } from '@ai-video-studio/validation';

export type InteractionOffsets = {
  groupPosition: [number, number, number];
  groupRotation: [number, number, number];
};

const zero: InteractionOffsets = {
  groupPosition: [0, 0, 0],
  groupRotation: [0, 0, 0],
};

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

export function sampleInteractionOffsets(
  interactions: Interaction[] | undefined,
  timeSec: number,
): InteractionOffsets {
  if (!interactions?.length) return zero;

  for (const ix of interactions) {
    const end = ix.startSec + ix.durationSec;
    if (timeSec < ix.startSec || timeSec > end) continue;

    const t = easeInOut((timeSec - ix.startSec) / Math.max(ix.durationSec, 0.001));
    const target = ix.targetPosition ?? [0, 0, 2];

    switch (ix.type) {
      case 'walk_to':
        return {
          groupPosition: [target[0] * t, 0, target[2] * t],
          groupRotation: [0, Math.atan2(target[0], target[2]) * t * 0.35, 0],
        };
      case 'sit_on': {
        const sitY = t < 0.5 ? 0 : -0.35 * easeInOut((t - 0.5) / 0.5);
        return {
          groupPosition: [target[0] * 0.4, sitY, target[2] * 0.4],
          groupRotation: [0, 0, 0],
        };
      }
      case 'look_at':
        return {
          groupPosition: zero.groupPosition,
          groupRotation: [
            0,
            easeInOut(t) * Math.atan2(target[0], Math.max(0.5, target[2])),
            0,
          ],
        };
      default:
        break;
    }
  }
  return zero;
}