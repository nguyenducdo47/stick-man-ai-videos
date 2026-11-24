import {
  ACTION_REGISTRY,
  isGltfClipAction,
  resolveActionId,
  resolveGltfClipName,
} from '@ai-video-studio/animation-engine';
import type { ActionId, Interaction } from '@ai-video-studio/validation';
import { useAnimations, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef } from 'react';
import type { AnimationAction, Group } from 'three';

import { ProceduralStickman } from './procedural-stickman.js';
import { resolveActionAtTime, type StickmanColors } from './procedural-pose.js';

/** Default scale for CC0 low-poly hero rigs (tune per model). */
const HERO_GLB_SCALE = 1;
const HERO_GLB_POSITION: [number, number, number] = [0, 0, 0];

export type HeroGlbLoadedProps = {
  glbUrl: string;
  colors: StickmanColors;
  actionId?: ActionId;
  actionClips?: { actionId: ActionId; startSec: number; durationSec: number }[];
  interactions?: Interaction[];
  timeSec: number;
};

function pickGltfAction(
  actions: Record<string, AnimationAction | null>,
  actionId: ActionId,
): AnimationAction | null {
  const resolved = resolveActionId(actionId);
  const def = ACTION_REGISTRY[resolved];
  if (def.implementation !== 'gltf_clip') {
    return null;
  }
  const candidates = [
    def.gltfClipName,
    resolveGltfClipName(resolved),
    resolved,
    actionId,
  ].filter(Boolean) as string[];

  for (const name of candidates) {
    const direct = actions[name];
    if (direct) return direct;
    const lower = name.toLowerCase();
    const fuzzy = Object.entries(actions).find(([key]) =>
      key.toLowerCase().includes(lower),
    );
    if (fuzzy?.[1]) return fuzzy[1];
  }
  return null;
}

function clipLocalTime(
  clips: HeroGlbLoadedProps['actionClips'],
  timeSec: number,
): number {
  if (!clips?.length) return timeSec;
  for (const c of clips) {
    if (timeSec >= c.startSec && timeSec < c.startSec + c.durationSec) {
      return timeSec - c.startSec;
    }
  }
  return timeSec;
}

export function HeroGlbLoaded({
  glbUrl,
  colors,
  actionId,
  actionClips,
  interactions,
  timeSec,
}: HeroGlbLoadedProps) {
  const group = useRef<Group>(null);
  const gltf = useGLTF(glbUrl);
  const clonedScene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const { actions, mixer } = useAnimations(gltf.animations, group);

  const activeAction: ActionId = useMemo(() => {
    if (actionId) return actionId;
    if (actionClips?.length) return resolveActionAtTime(actionClips, timeSec);
    return 'idle';
  }, [actionId, actionClips, timeSec]);

  const localT = useMemo(
    () => clipLocalTime(actionClips, timeSec),
    [actionClips, timeSec],
  );

  const gltfAct = useMemo(
    () => pickGltfAction(actions, activeAction),
    [actions, activeAction],
  );

  const useGlbPlayback =
    gltf.animations.length > 0 && gltfAct !== null && isGltfClipAction(activeAction);

  useEffect(() => {
    if (!useGlbPlayback || !gltfAct) return;
    for (const a of Object.values(actions)) {
      a?.stop();
    }
    gltfAct.reset();
    gltfAct.play();
    gltfAct.paused = true;
  }, [actions, gltfAct, useGlbPlayback]);

  useFrame(() => {
    if (!useGlbPlayback || !gltfAct || !mixer) return;
    const dur = gltfAct.getClip().duration || 1;
    gltfAct.time = localT % dur;
    mixer.update(0);
  });

  if (!useGlbPlayback) {
    return (
      <ProceduralStickman
        colors={colors}
        actionId={actionId}
        actionClips={actionClips}
        interactions={interactions}
        timeSec={timeSec}
      />
    );
  }

  return (
    <group ref={group} scale={HERO_GLB_SCALE} position={HERO_GLB_POSITION}>
      <primitive object={clonedScene} />
    </group>
  );
}