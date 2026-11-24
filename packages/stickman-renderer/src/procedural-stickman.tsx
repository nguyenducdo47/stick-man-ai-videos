import { sampleInteractionOffsets } from '@ai-video-studio/animation-engine';
import type { ActionId, Interaction } from '@ai-video-studio/validation';
import React, { useMemo, useRef } from 'react';
import type { Group } from 'three';

import {
  resolveActionAtTime,
  sampleProceduralPose,
  type StickmanColors,
} from './procedural-pose.js';

const TOY = { roughness: 0.88, metalness: 0.03 };

export function ProceduralStickman({
  colors,
  actionId,
  actionClips,
  interactions,
  timeSec,
}: {
  colors: StickmanColors;
  actionId?: ActionId;
  actionClips?: { actionId: ActionId; startSec: number; durationSec: number }[];
  interactions?: Interaction[];
  timeSec: number;
}) {
  const group = useRef<Group>(null);
  const activeAction: ActionId = useMemo(() => {
    if (actionId) return actionId;
    if (actionClips?.length) return resolveActionAtTime(actionClips, timeSec);
    return 'idle';
  }, [actionId, actionClips, timeSec]);

  const clipLocalT = useMemo(() => {
    if (!actionClips?.length) return timeSec;
    for (const c of actionClips) {
      if (timeSec >= c.startSec && timeSec < c.startSec + c.durationSec) {
        return timeSec - c.startSec;
      }
    }
    return timeSec;
  }, [actionClips, timeSec]);

  const pose = useMemo(() => {
    const base = sampleProceduralPose(activeAction, clipLocalT);
    const off = sampleInteractionOffsets(interactions, timeSec);
    return {
      ...base,
      groupPosition: [
        base.groupPosition[0] + off.groupPosition[0],
        base.groupPosition[1] + off.groupPosition[1],
        base.groupPosition[2] + off.groupPosition[2],
      ] as [number, number, number],
      groupRotation: [
        base.groupRotation[0] + off.groupRotation[0],
        base.groupRotation[1] + off.groupRotation[1],
        base.groupRotation[2] + off.groupRotation[2],
      ] as [number, number, number],
    };
  }, [activeAction, clipLocalT, interactions, timeSec]);

  return (
    <group
      ref={group}
      position={pose.groupPosition}
      rotation={pose.groupRotation}
    >
      <group rotation={[0, 0, pose.torsoLeanZ]}>
        <mesh position={[0, 1.38, 0]} castShadow>
          <sphereGeometry args={[0.24, 20, 20]} />
          <meshStandardMaterial color={colors.body} {...TOY} />
        </mesh>
        <mesh position={[-0.07, 1.42, 0.2]} castShadow>
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.1} />
        </mesh>
        <mesh position={[0.07, 1.42, 0.2]} castShadow>
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.95, 0]} castShadow>
          <boxGeometry args={[0.44, 0.52, 0.24]} />
          <meshStandardMaterial color={colors.hoodie} {...TOY} />
        </mesh>
        <mesh position={[-0.35, 0.95, 0]} rotation={[0, 0, pose.leftArmZ]} castShadow>
          <capsuleGeometry args={[0.065, 0.42, 8, 12]} />
          <meshStandardMaterial color={colors.body} {...TOY} />
        </mesh>
        <mesh position={[0.35, 0.95, 0]} rotation={[0, 0, pose.rightArmZ]} castShadow>
          <capsuleGeometry args={[0.065, 0.42, 8, 12]} />
          <meshStandardMaterial color={colors.body} {...TOY} />
        </mesh>
        <mesh position={[-0.14, 0.4, 0]} rotation={[0, 0, pose.leftLegZ]} castShadow>
          <capsuleGeometry args={[0.07, 0.48, 8, 12]} />
          <meshStandardMaterial color={colors.body} {...TOY} />
        </mesh>
        <mesh position={[0.14, 0.4, 0]} rotation={[0, 0, pose.rightLegZ]} castShadow>
          <capsuleGeometry args={[0.07, 0.48, 8, 12]} />
          <meshStandardMaterial color={colors.body} {...TOY} />
        </mesh>
        <mesh position={[-0.14, 0.05, 0.08]} castShadow>
          <boxGeometry args={[0.15, 0.09, 0.24]} />
          <meshStandardMaterial color={colors.shoes} {...TOY} />
        </mesh>
        <mesh position={[0.14, 0.05, 0.08]} castShadow>
          <boxGeometry args={[0.15, 0.09, 0.24]} />
          <meshStandardMaterial color={colors.shoes} {...TOY} />
        </mesh>
      </group>
    </group>
  );
}