import type { ActionId } from '@ai-video-studio/validation';

export type StickmanColors = {
  body: string;
  hoodie: string;
  shoes: string;
};

export type ProceduralPose = {
  groupPosition: [number, number, number];
  groupRotation: [number, number, number];
  leftArmZ: number;
  rightArmZ: number;
  leftLegZ: number;
  rightLegZ: number;
  torsoLeanZ: number;
};

const zeroPose = (): ProceduralPose => ({
  groupPosition: [0, 0, 0],
  groupRotation: [0, 0, 0],
  leftArmZ: 0.25,
  rightArmZ: -0.25,
  leftLegZ: 0,
  rightLegZ: 0,
  torsoLeanZ: 0,
});

export function sampleProceduralPose(actionId: ActionId, t: number): ProceduralPose {
  const p = zeroPose();
  switch (actionId) {
    case 'walk':
      p.groupPosition = [0, 0, Math.sin(t * 2) * 0.15];
      p.groupRotation = [0, 0, Math.sin(t * 4) * 0.04];
      p.leftLegZ = Math.sin(t * 4) * 0.35;
      p.rightLegZ = Math.sin(t * 4 + Math.PI) * 0.35;
      p.leftArmZ = 0.25 + Math.sin(t * 4 + Math.PI) * 0.2;
      p.rightArmZ = -0.25 + Math.sin(t * 4) * 0.2;
      break;
    case 'run':
      p.groupPosition = [0, 0, Math.sin(t * 4) * 0.35];
      p.groupRotation = [0.08, 0, Math.sin(t * 8) * 0.06];
      p.leftLegZ = Math.sin(t * 8) * 0.55;
      p.rightLegZ = Math.sin(t * 8 + Math.PI) * 0.55;
      p.torsoLeanZ = 0.12;
      break;
    case 'jump':
      p.groupPosition = [0, Math.abs(Math.sin(t * 3)) * 0.45, 0];
      break;
    case 'sit':
      p.groupPosition = [0, -0.35, 0];
      p.leftLegZ = -1.1;
      p.rightLegZ = -1.1;
      p.torsoLeanZ = -0.15;
      break;
    case 'stand_up':
      p.groupPosition = [0, -0.35 + Math.min(1, t) * 0.35, 0];
      break;
    case 'point':
      p.groupRotation = [0, 0.15, 0];
      p.leftArmZ = -0.9;
      break;
    case 'wave':
      p.rightArmZ = -0.25 + Math.sin(t * 3) * 0.45;
      break;
    case 'talk':
    case 'explain':
      p.leftArmZ = 0.4 + Math.sin(t * 5) * 0.25;
      p.rightArmZ = -0.4 + Math.sin(t * 5 + 0.8) * 0.2;
      break;
    case 'think':
      p.groupRotation = [0, -0.2, 0];
      p.rightArmZ = -0.2 + Math.sin(t * 1.5) * 0.05;
      p.leftArmZ = 0.6;
      break;
    case 'look_around':
      p.groupRotation = [0, Math.sin(t * 1.2) * 0.45, 0];
      break;
    case 'turn':
      p.groupRotation = [0, Math.min(1, t * 0.5) * Math.PI * 0.5, 0];
      break;
    case 'celebrate':
      p.leftArmZ = 1.2 + Math.sin(t * 6) * 0.15;
      p.rightArmZ = -1.2 + Math.sin(t * 6) * 0.15;
      p.groupPosition = [0, Math.sin(t * 8) * 0.08, 0];
      break;
    case 'shake_hands':
      p.groupRotation = [0, 0.35, 0];
      p.rightArmZ = -0.4 + Math.sin(t * 4) * 0.12;
      break;
    case 'pick_up':
    case 'put_down':
      p.torsoLeanZ = 0.25 * Math.sin(Math.min(1, t) * Math.PI);
      p.leftArmZ = 0.5;
      break;
    case 'push':
    case 'pull':
      p.groupPosition = [0, 0, actionId === 'push' ? t * 0.1 : -t * 0.1];
      p.leftArmZ = 0.45;
      p.rightArmZ = -0.45;
      break;
    case 'open_door':
    case 'close_door':
      p.rightArmZ = -0.3 + Math.sin(t * 2) * 0.35;
      break;
    case 'climb':
      p.groupPosition = [0, Math.min(1.2, t * 0.25), 0];
      break;
    case 'fall':
      p.groupRotation = [Math.min(0.6, t * 0.5), 0, 0];
      p.groupPosition = [0, -Math.min(0.4, t * 0.3), 0];
      break;
    case 'idle':
    default:
      p.groupPosition = [0, Math.sin(t * 1.5) * 0.02, 0];
      break;
  }
  return p;
}

export function resolveActionAtTime(
  clips: { actionId: ActionId; startSec: number; durationSec: number }[],
  timeSec: number,
): ActionId {
  if (clips.length === 0) return 'idle';
  let current = clips[clips.length - 1]!.actionId;
  for (const clip of clips) {
    if (timeSec >= clip.startSec && timeSec < clip.startSec + clip.durationSec) {
      current = clip.actionId;
      break;
    }
  }
  return current;
}