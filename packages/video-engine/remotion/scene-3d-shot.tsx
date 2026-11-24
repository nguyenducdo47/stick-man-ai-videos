import {
  CAMERA_PRESETS,
  resolveCameraPreset,
} from '@ai-video-studio/animation-engine';
import { PerspectiveCamera } from '@react-three/drei';
import { ThreeCanvas } from '@remotion/three';
import React from 'react';
import { useVideoConfig } from 'remotion';

import { StickmanFigure } from './stickman-figure';
import type { StickmanColors } from './types';

export function Scene3DShot({
  animationPreset,
  cameraPreset,
  characterColors,
}: {
  animationPreset: string;
  cameraPreset: string;
  characterColors: StickmanColors;
}) {
  const { width, height } = useVideoConfig();
  const camKey = resolveCameraPreset(cameraPreset);
  const cam = CAMERA_PRESETS[camKey];

  return (
    <ThreeCanvas width={width} height={Math.round(height * 0.78)} linear>
      <color attach="background" args={['#09090b']} />
      <fog attach="fog" args={['#09090b', 8, 22]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 8, 4]} intensity={1.1} castShadow />
      <PerspectiveCamera
        makeDefault
        position={cam.position}
        fov={cam.fov}
        onUpdate={(self) => self.lookAt(...cam.target)}
      />
      <gridHelper args={[12, 12, '#27272a', '#18181b']} position={[0, 0, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0c0c0e" />
      </mesh>
      <StickmanFigure animationPreset={animationPreset} colors={characterColors} />
    </ThreeCanvas>
  );
}