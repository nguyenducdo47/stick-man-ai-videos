'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import type { SceneGraphDocument } from '@ai-video-studio/validation';
import { CAMERA_PRESETS } from '@ai-video-studio/animation-engine';

import { StickmanFigure } from '@/components/stickman-figure';

export function SceneGraphCanvas({
  graph,
  sceneIndex,
}: {
  graph: SceneGraphDocument;
  sceneIndex: number;
}) {
  const scene = graph.scenes[sceneIndex] ?? graph.scenes[0];
  if (!scene) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-sm text-zinc-500">
        No scenes to preview
      </div>
    );
  }

  const cam =
    CAMERA_PRESETS[scene.cameraPreset as keyof typeof CAMERA_PRESETS] ??
    CAMERA_PRESETS['wide-shot'];

  return (
    <div>
      <h3 className="sr-only">3D preview scene {sceneIndex + 1}</h3>
      <div className="h-72 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
        <Canvas shadows>
          <color attach="background" args={['#09090b']} />
          <ambientLight intensity={0.55} />
          <directionalLight position={[4, 8, 4]} intensity={1.1} />
          <PerspectiveCamera
            makeDefault
            position={cam.position}
            fov={cam.fov}
            onUpdate={(self) => self.lookAt(...cam.target)}
          />
          <gridHelper args={[12, 12, '#27272a', '#18181b']} position={[0, 0, 0]} />
          <StickmanFigure animationPreset={scene.animationPreset} />
          <OrbitControls target={cam.target} enablePan={false} />
        </Canvas>
      </div>
      <p className="mt-2 text-xs text-zinc-500">
        {scene.title ?? `Scene ${scene.sortOrder + 1}`} · {scene.animationPreset} ·{' '}
        {scene.cameraPreset} · {scene.durationSec}s
      </p>
    </div>
  );
}