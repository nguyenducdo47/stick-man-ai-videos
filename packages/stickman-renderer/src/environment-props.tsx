import { ENVIRONMENT_PRESETS } from '@ai-video-studio/animation-engine';
import type { EnvironmentId } from '@ai-video-studio/validation';
import React from 'react';

import { EnvironmentGlbScene } from './environment-glb-scene.js';
import { IllustrationEnvironmentScene } from './environment-illustration-scenes.js';

type PropBox = {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
};

function propLayout(propId: string): PropBox | null {
  const layouts: Record<string, PropBox> = {
    sofa: { position: [0, 0.35, -2.5], size: [2.2, 0.6, 0.9], color: '#7f1d1d' },
    coffee_table: { position: [0, 0.2, -1.2], size: [1, 0.12, 0.6], color: '#57534e' },
    tv_wall: { position: [0, 1.2, -4.2], size: [3.5, 1.8, 0.15], color: '#27272a' },
    road: { position: [0, 0.02, -3], size: [8, 0.04, 3], color: '#334155' },
    sidewalk: { position: [2.2, 0.06, 0], size: [2, 0.08, 8], color: '#475569' },
    building_a: { position: [-4, 2.5, -5], size: [2.5, 5, 2], color: '#64748b' },
    building_b: { position: [4, 3, -6], size: [3, 6, 2], color: '#94a3b8' },
    tree_a: { position: [-2.5, 1.2, -2], size: [0.3, 2.4, 0.3], color: '#422006' },
    tree_b: { position: [2.8, 1.4, -1.5], size: [0.35, 2.8, 0.35], color: '#422006' },
    path: { position: [0, 0.04, -2], size: [1.5, 0.05, 6], color: '#a8a29e' },
    bench: { position: [1.8, 0.25, -1], size: [1.2, 0.12, 0.4], color: '#78350f' },
    desk: { position: [0, 0.45, -2], size: [1.8, 0.08, 0.8], color: '#44403c' },
    office_chair: { position: [0, 0.35, -0.8], size: [0.5, 0.6, 0.5], color: '#171717' },
    whiteboard: { position: [0, 1.4, -3.8], size: [2.5, 1.2, 0.08], color: '#fafafa' },
  };
  return layouts[propId] ?? null;
}

function StudioPropBoxes({ environmentId }: { environmentId: EnvironmentId }) {
  const preset = ENVIRONMENT_PRESETS[environmentId];
  return (
    <group>
      {preset.propIds.map((propId) => {
        const box = propLayout(propId);
        if (!box) return null;
        if (propId === 'tree_a' || propId === 'tree_b') {
          return (
            <group key={propId} position={box.position}>
              <mesh position={[0, box.size[1] / 2, 0]}>
                <cylinderGeometry args={[box.size[0], box.size[0], box.size[1], 8]} />
                <meshStandardMaterial color={box.color} />
              </mesh>
              <mesh position={[0, box.size[1] + 0.5, 0]}>
                <sphereGeometry args={[0.75, 12, 12]} />
                <meshStandardMaterial color="#166534" />
              </mesh>
            </group>
          );
        }
        return (
          <mesh key={propId} position={box.position}>
            <boxGeometry args={box.size} />
            <meshStandardMaterial color={box.color} />
          </mesh>
        );
      })}
    </group>
  );
}

export function EnvironmentProps({
  environmentId,
  environmentGlbUrl,
}: {
  environmentId: EnvironmentId;
  environmentGlbUrl?: string | null;
}) {
  return (
    <group>
      {environmentId === 'studio_grid' ? (
        <StudioPropBoxes environmentId={environmentId} />
      ) : (
        <IllustrationEnvironmentScene environmentId={environmentId} />
      )}
      {environmentGlbUrl ? (
        <EnvironmentGlbScene glbUrl={environmentGlbUrl} environmentId={environmentId} />
      ) : null}
    </group>
  );
}

export function EnvironmentGround({
  environmentId,
}: {
  environmentId: EnvironmentId;
}) {
  const preset = ENVIRONMENT_PRESETS[environmentId];
  const { fogNear, fogFar } = preset.lighting;
  return (
    <>
      <color attach="background" args={[preset.skyColor]} />
      <fog attach="fog" args={[preset.skyColor, fogNear, fogFar]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[28, 28]} />
        <meshStandardMaterial color={preset.groundColor} roughness={0.95} metalness={0.02} />
      </mesh>
      {environmentId === 'studio_grid' ? (
        <gridHelper args={[12, 12, '#27272a', '#18181b']} />
      ) : null}
    </>
  );
}