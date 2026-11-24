'use client';

import { StickmanSceneBody } from './stickman-scene.js';
import type { StickmanSceneProps } from './stickman-scene.js';
import { Canvas, useFrame } from '@react-three/fiber';
import React, { useState } from 'react';

function SceneWithClock(props: Omit<StickmanSceneProps, 'timeSec'>) {
  const [timeSec, setTimeSec] = useState(0);
  useFrame((state) => {
    setTimeSec(state.clock.elapsedTime);
  });
  return <StickmanSceneBody {...props} timeSec={timeSec} />;
}

export function PreviewStickmanCanvas(
  props: Omit<StickmanSceneProps, 'timeSec'> & {
    className?: string;
    /** Fixed scrub time — disables live clock when set. */
    previewTimeSec?: number;
  },
) {
  const { className, previewTimeSec, ...sceneProps } = props;
  return (
    <div className={className ?? 'h-72 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950'}>
      <Canvas shadows>
        {previewTimeSec != null ? (
          <StickmanSceneBody {...sceneProps} timeSec={previewTimeSec} />
        ) : (
          <SceneWithClock {...sceneProps} />
        )}
      </Canvas>
    </div>
  );
}