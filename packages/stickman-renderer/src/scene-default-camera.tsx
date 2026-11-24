import { sampleCameraAtTime } from '@ai-video-studio/animation-engine';
import { useThree } from '@react-three/fiber';
import type { CameraKeyframe } from '@ai-video-studio/validation';
import React, { useLayoutEffect, useMemo } from 'react';
import { PerspectiveCamera, Vector3 } from 'three';

export function SceneDefaultCamera({
  cameraPreset,
  cameraKeyframes,
  timeSec,
}: {
  cameraPreset: string;
  cameraKeyframes?: CameraKeyframe[];
  timeSec: number;
}) {
  const set = useThree((state) => state.set);
  const size = useThree((state) => state.size);
  const sampled = useMemo(
    () => sampleCameraAtTime(cameraKeyframes, cameraPreset, timeSec),
    [cameraKeyframes, cameraPreset, timeSec],
  );
  const camera = useMemo(
    () => new PerspectiveCamera(sampled.fov, 1, 0.1, 200),
    [sampled.fov],
  );

  useLayoutEffect(() => {
    camera.aspect = size.width / Math.max(size.height, 1);
    camera.position.set(...sampled.position);
    camera.up.set(0, 1, 0);
    camera.lookAt(new Vector3(...sampled.target));
    camera.updateProjectionMatrix();
    set({ camera });
  }, [camera, sampled, set, size.width, size.height, timeSec]);

  return null;
}