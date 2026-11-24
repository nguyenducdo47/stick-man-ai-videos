import {
  resolveAnimationPreset,
  type AnimationPresetId,
} from '@ai-video-studio/animation-engine';
import { useFrame } from '@react-three/fiber';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import React, { useMemo, useRef } from 'react';
import type { Group } from 'three';

import type { StickmanColors } from './types';

export function StickmanFigure({
  animationPreset,
  colors,
}: {
  animationPreset: string;
  colors: StickmanColors;
}) {
  const group = useRef<Group>(null);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const preset: AnimationPresetId = useMemo(
    () => resolveAnimationPreset(animationPreset),
    [animationPreset],
  );

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    g.rotation.y = 0;
    g.position.z = 0;
    g.rotation.z = 0;
    if (preset === 'walk') {
      g.position.z = Math.sin(t * 2) * 0.15;
      g.rotation.z = Math.sin(t * 4) * 0.04;
    } else if (preset === 'point') {
      g.rotation.y = 0.15;
    } else if (preset === 'wave') {
      g.rotation.z = Math.sin(t * 3) * 0.06;
    }
  });

  const limbMat = { color: colors.body };
  const hoodieMat = { color: colors.hoodie };
  const shoeMat = { color: colors.shoes };

  return (
    <group ref={group} position={[0, 0, 0]}>
      <mesh position={[0, 1.35, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial {...limbMat} />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[0.42, 0.5, 0.22]} />
        <meshStandardMaterial {...hoodieMat} />
      </mesh>
      <mesh
        position={[-0.35, 0.95, 0]}
        rotation={[0, 0, preset === 'point' ? -0.9 : 0.25]}
      >
        <boxGeometry args={[0.12, 0.5, 0.12]} />
        <meshStandardMaterial {...limbMat} />
      </mesh>
      <mesh position={[0.35, 0.95, 0]} rotation={[0, 0, -0.25]}>
        <boxGeometry args={[0.12, 0.5, 0.12]} />
        <meshStandardMaterial {...limbMat} />
      </mesh>
      <mesh
        position={[-0.14, 0.4, 0]}
        rotation={[0, 0, preset === 'walk' ? 0.35 : 0]}
      >
        <boxGeometry args={[0.12, 0.55, 0.12]} />
        <meshStandardMaterial {...limbMat} />
      </mesh>
      <mesh
        position={[0.14, 0.4, 0]}
        rotation={[0, 0, preset === 'walk' ? -0.35 : 0]}
      >
        <boxGeometry args={[0.12, 0.55, 0.12]} />
        <meshStandardMaterial {...limbMat} />
      </mesh>
      <mesh position={[-0.14, 0.05, 0.08]}>
        <boxGeometry args={[0.14, 0.08, 0.22]} />
        <meshStandardMaterial {...shoeMat} />
      </mesh>
      <mesh position={[0.14, 0.05, 0.08]}>
        <boxGeometry args={[0.14, 0.08, 0.22]} />
        <meshStandardMaterial {...shoeMat} />
      </mesh>
    </group>
  );
}