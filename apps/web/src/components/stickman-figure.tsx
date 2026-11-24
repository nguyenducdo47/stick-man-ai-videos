'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';

import type { AnimationPresetId } from '@ai-video-studio/animation-engine';

const COLORS = {
  body: '#f5f5f5',
  hoodie: '#dc2626',
  shoes: '#171717',
} as const;

export function StickmanFigure({
  animationPreset,
}: {
  animationPreset: AnimationPresetId | string;
}) {
  const group = useRef<Group>(null);
  const preset = useMemo(() => String(animationPreset), [animationPreset]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.rotation.y = 0;
    if (preset === 'walk') {
      g.position.z = Math.sin(t * 2) * 0.15;
      g.rotation.z = Math.sin(t * 4) * 0.04;
    } else if (preset === 'point') {
      g.rotation.y = 0.15;
    } else if (preset === 'wave') {
      g.rotation.z = Math.sin(t * 3) * 0.06;
    }
  });

  const limbMat = { color: COLORS.body };
  const hoodieMat = { color: COLORS.hoodie };
  const shoeMat = { color: COLORS.shoes };

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
      <mesh position={[-0.35, 0.95, 0]} rotation={[0, 0, preset === 'point' ? -0.9 : 0.25]}>
        <boxGeometry args={[0.12, 0.5, 0.12]} />
        <meshStandardMaterial {...limbMat} />
      </mesh>
      <mesh position={[0.35, 0.95, 0]} rotation={[0, 0, -0.25]}>
        <boxGeometry args={[0.12, 0.5, 0.12]} />
        <meshStandardMaterial {...limbMat} />
      </mesh>
      <mesh position={[-0.14, 0.4, 0]} rotation={[0, 0, preset === 'walk' ? 0.35 : 0]}>
        <boxGeometry args={[0.12, 0.55, 0.12]} />
        <meshStandardMaterial {...limbMat} />
      </mesh>
      <mesh position={[0.14, 0.4, 0]} rotation={[0, 0, preset === 'walk' ? -0.35 : 0]}>
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