import type { EnvironmentId } from '@ai-video-studio/validation';
import React from 'react';

/** Matte “toy” shading for illustration-style environments. */
function Matte({ color, emissive }: { color: string; emissive?: string }) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={0.9}
      metalness={0.04}
      emissive={emissive ?? '#000000'}
      emissiveIntensity={emissive ? 0.55 : 0}
    />
  );
}

function PineTree({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  const s = scale;
  return (
    <group position={position} scale={[s, s, s]}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 1.1, 8]} />
        <Matte color="#6d4c2b" />
      </mesh>
      <mesh position={[0, 1.35, 0]} castShadow>
        <coneGeometry args={[0.55, 0.7, 8]} />
        <Matte color="#15803d" />
      </mesh>
      <mesh position={[0, 1.85, 0]} castShadow>
        <coneGeometry args={[0.42, 0.55, 8]} />
        <Matte color="#22c55e" />
      </mesh>
      <mesh position={[0, 2.25, 0]} castShadow>
        <coneGeometry args={[0.28, 0.45, 8]} />
        <Matte color="#4ade80" />
      </mesh>
    </group>
  );
}

function LowPolyTree({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.18, 1, 6]} />
        <Matte color="#78350f" />
      </mesh>
      <mesh position={[0, 1.35, 0]} castShadow>
        <dodecahedronGeometry args={[0.65, 0]} />
        <Matte color="#16a34a" />
      </mesh>
    </group>
  );
}

function GrassTuft({
  position,
  yaw = 0,
}: {
  position: [number, number, number];
  yaw?: number;
}) {
  return (
    <mesh position={position} rotation={[0, yaw, 0]} castShadow>
      <coneGeometry args={[0.08, 0.18, 4]} />
      <Matte color="#22c55e" />
    </mesh>
  );
}

export function ParkIllustrationScene() {
  const grassTufts: { position: [number, number, number]; yaw: number }[] = [
    { position: [-3, 0.09, -1.5], yaw: 0.3 },
    { position: [-2.2, 0.09, 0.8], yaw: 1.1 },
    { position: [1.5, 0.09, -0.5], yaw: 2.0 },
    { position: [3.2, 0.09, -2], yaw: 0.8 },
    { position: [-1, 0.09, 2], yaw: 1.6 },
    { position: [2.5, 0.09, 1.2], yaw: 2.4 },
  ];
  return (
    <group>
      {[-4.5, -1.5, 2.5, 4].map((x, i) => (
        <PineTree key={`pine-${i}`} position={[x, 0, -3.2 - (i % 2) * 1.2]} scale={0.9 + (i % 3) * 0.15} />
      ))}
      <LowPolyTree position={[-2.8, 0, -1]} />
      <LowPolyTree position={[3.5, 0, -0.5]} />
      {grassTufts.map((p, i) => (
        <GrassTuft key={`grass-${i}`} position={p.position} yaw={p.yaw} />
      ))}
      <mesh position={[0, 0.03, -2.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.6, 7]} />
        <Matte color="#d6d3d1" />
      </mesh>
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh
          key={`stone-${i}`}
          position={[0.12 * (i % 2 === 0 ? 1 : -1), 0.07, -4.5 + i * 0.55]}
          castShadow
        >
          <boxGeometry args={[0.35, 0.06, 0.4]} />
          <Matte color="#a8a29e" />
        </mesh>
      ))}
      <mesh position={[-2.2, 0.02, 1.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.4, 24]} />
        <Matte color="#38bdf8" />
      </mesh>
      <mesh position={[-2.2, 0.04, 1.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.35, 1.55, 24]} />
        <Matte color="#78716c" />
      </mesh>
      <mesh position={[3.5, 1.1, -4.5]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 2.2, 6]} />
        <Matte color="#57534e" />
      </mesh>
      {[-0.9, 0, 0.9].map((x, i) => (
        <mesh key={`gaz-post-${i}`} position={[3.5 + x, 0.9, -4.5]} castShadow>
          <boxGeometry args={[0.1, 1.8, 0.1]} />
          <Matte color="#a16207" />
        </mesh>
      ))}
      <mesh position={[3.5, 2.1, -4.5]} castShadow>
        <coneGeometry args={[1.35, 0.65, 4]} />
        <Matte color="#92400e" />
      </mesh>
      <mesh position={[1.9, 0.28, -0.8]} castShadow>
        <boxGeometry args={[1.3, 0.14, 0.45]} />
        <Matte color="#92400e" />
      </mesh>
      <mesh position={[1.9, 0.42, -1.05]} castShadow>
        <boxGeometry args={[1.3, 0.08, 0.08]} />
        <Matte color="#78350f" />
      </mesh>
    </group>
  );
}

export function LivingRoomIllustrationScene() {
  return (
    <group>
      <mesh position={[0, 1.6, -4.5]} receiveShadow>
        <boxGeometry args={[10, 3.2, 0.15]} />
        <Matte color="#fef3c7" />
      </mesh>
      <mesh position={[0, 1.05, -4.42]} receiveShadow>
        <boxGeometry args={[10, 1.4, 0.12]} />
        <Matte color="#fdba74" />
      </mesh>
      <mesh position={[0, 0.02, -1.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4.2, 3.2]} />
        <Matte color="#fbcfe8" />
      </mesh>
      <mesh position={[-0.8, 0.38, -2.8]} castShadow>
        <boxGeometry args={[2.8, 0.55, 1]} />
        <Matte color="#f5f5f4" />
      </mesh>
      <mesh position={[1.6, 0.38, -2.2]} castShadow>
        <boxGeometry args={[1, 0.55, 2.2]} />
        <Matte color="#f5f5f4" />
      </mesh>
      <mesh position={[-0.3, 0.55, -2.85]} castShadow>
        <boxGeometry args={[0.5, 0.35, 0.5]} />
        <Matte color="#6366f1" />
      </mesh>
      <mesh position={[0.4, 0.22, -1.15]} castShadow>
        <boxGeometry args={[1.1, 0.12, 0.65]} />
        <Matte color="#78716c" />
      </mesh>
      <mesh position={[1.4, 0.55, -3.9]} castShadow>
        <boxGeometry args={[2.8, 0.45, 0.55]} />
        <Matte color="#d4d4d8" />
      </mesh>
      <mesh position={[1.4, 0.95, -4.05]} castShadow>
        <boxGeometry args={[1.8, 1.05, 0.08]} />
        <Matte color="#1e293b" />
      </mesh>
      <mesh position={[2.2, 0.42, -1.7]} castShadow>
        <cylinderGeometry args={[0.18, 0.22, 0.35, 12]} />
        <Matte color="#b45309" />
      </mesh>
      <mesh position={[2.2, 0.75, -1.7]} castShadow>
        <sphereGeometry args={[0.32, 12, 12]} />
        <Matte color="#15803d" />
      </mesh>
      <mesh position={[-2.4, 0.78, -1.5]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.65, 10]} />
        <Matte color="#facc15" />
      </mesh>
      <mesh position={[-2.4, 1.22, -1.5]} castShadow>
        <coneGeometry args={[0.22, 0.28, 8]} />
        <Matte color="#fef9c3" emissive="#fef08a" />
      </mesh>
      <pointLight position={[-2.4, 1.35, -1.3]} intensity={0.35} color="#fef08a" distance={6} />
    </group>
  );
}

export function StreetIllustrationScene() {
  return (
    <group>
      <mesh position={[0, 0.02, -3.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[7, 3.5]} />
        <Matte color="#334155" />
      </mesh>
      <mesh position={[2.3, 0.05, 0]} receiveShadow>
        <boxGeometry args={[1.8, 0.08, 9]} />
        <Matte color="#cbd5e1" />
      </mesh>
      <mesh position={[-1.5, 0.04, 1.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4, 6]} />
        <Matte color="#4ade80" />
      </mesh>
      <mesh position={[-4.2, 2.8, -5.5]} castShadow>
        <boxGeometry args={[2.8, 5.6, 2.4]} />
        <Matte color="#dc2626" />
      </mesh>
      <mesh position={[-4.2, 5.9, -5.35]} castShadow>
        <boxGeometry args={[1.4, 0.9, 0.08]} />
        <Matte color="#facc15" />
      </mesh>
      <PineTree position={[4.2, 0, 0.5]} scale={1.05} />
      <PineTree position={[4.5, 0, -2.5]} scale={0.85} />
      <mesh position={[3.8, 1.8, 1.8]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 3.6, 8]} />
        <Matte color="#64748b" />
      </mesh>
      <mesh position={[3.8, 3.35, 1.95]} castShadow>
        <boxGeometry args={[0.9, 0.55, 0.06]} />
        <Matte color="#f8fafc" />
      </mesh>
      <mesh position={[-3.5, 0.22, -0.6]} castShadow>
        <boxGeometry args={[1.2, 0.12, 0.4]} />
        <Matte color="#92400e" />
      </mesh>
    </group>
  );
}

export function OfficeIllustrationScene() {
  const binderColors = ['#22c55e', '#3b82f6', '#ef4444', '#eab308', '#a855f7'];
  return (
    <group>
      <mesh position={[0, 3.2, -2]} receiveShadow>
        <boxGeometry args={[9, 0.12, 7]} />
        <Matte color="#f8fafc" />
      </mesh>
      {[-2.2, 0, -4.8, -4.5, 2.4].map((x, i) => (
        <mesh key={`tile-${i}`} position={[x, 3.14, -1 + (i % 2)]} castShadow>
          <boxGeometry args={[1.1, 0.04, 1.1]} />
          <Matte color="#e2e8f0" emissive="#f1f5f9" />
        </mesh>
      ))}
      <mesh position={[0, 1.35, -4.2]} receiveShadow>
        <boxGeometry args={[3.5, 2.7, 0.12]} />
        <Matte color="#94a3b8" />
      </mesh>
      <mesh position={[0, 1.35, -4.05]} receiveShadow>
        <planeGeometry args={[3.2, 1.8]} />
        <Matte color="#87ceeb" />
      </mesh>
      <mesh position={[-0.9, 0.48, -2.2]} castShadow>
        <boxGeometry args={[1.9, 0.08, 0.85]} />
        <Matte color="#fafafa" />
      </mesh>
      <mesh position={[-0.9, 0.2, -2.2]} castShadow>
        <boxGeometry args={[0.35, 0.35, 0.55]} />
        <Matte color="#525252" />
      </mesh>
      <mesh position={[1.2, 0.48, -2.5]} castShadow>
        <boxGeometry args={[1.7, 0.08, 0.75]} />
        <Matte color="#fafafa" />
      </mesh>
      <mesh position={[1.2, 0.2, -2.5]} castShadow>
        <boxGeometry args={[0.32, 0.35, 0.5]} />
        <Matte color="#525252" />
      </mesh>
      <mesh position={[-0.9, 0.42, -1.2]} castShadow>
        <boxGeometry args={[0.55, 0.12, 0.55]} />
        <Matte color="#fafafa" />
      </mesh>
      <mesh position={[-0.9, 0.62, -1.35]} castShadow>
        <boxGeometry args={[0.5, 0.55, 0.08]} />
        <Matte color="#ea580c" />
      </mesh>
      <mesh position={[1.2, 0.42, -1.45]} castShadow>
        <boxGeometry args={[0.55, 0.12, 0.55]} />
        <Matte color="#fafafa" />
      </mesh>
      <mesh position={[1.2, 0.62, -1.6]} castShadow>
        <boxGeometry args={[0.5, 0.55, 0.08]} />
        <Matte color="#ea580c" />
      </mesh>
      <mesh position={[3.6, 1.35, -3.5]} castShadow>
        <boxGeometry args={[0.9, 2.7, 1.8]} />
        <Matte color="#fafafa" />
      </mesh>
      {binderColors.map((color, i) => (
        <mesh key={`binder-${i}`} position={[3.55, 0.55 + i * 0.32, -3.8 + (i % 2) * 0.35]} castShadow>
          <boxGeometry args={[0.12, 0.26, 0.55]} />
          <Matte color={color} />
        </mesh>
      ))}
      <mesh position={[-0.9, 0.58, -2.05]} castShadow>
        <boxGeometry args={[0.55, 0.35, 0.04]} />
        <Matte color="#71717a" />
      </mesh>
    </group>
  );
}

export function IllustrationEnvironmentScene({ environmentId }: { environmentId: EnvironmentId }) {
  switch (environmentId) {
    case 'park':
      return <ParkIllustrationScene />;
    case 'living_room':
      return <LivingRoomIllustrationScene />;
    case 'street':
      return <StreetIllustrationScene />;
    case 'office':
      return <OfficeIllustrationScene />;
    default:
      return null;
  }
}