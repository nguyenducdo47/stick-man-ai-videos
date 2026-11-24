import React from 'react';
import { Composition } from 'remotion';

import { ProjectVideo } from './ProjectVideo';
import type { RemotionProjectVideoProps } from './types';

const defaultProps: RemotionProjectVideoProps = {
  projectTitle: 'Preview',
  fps: 30,
  scenes: [],
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ProjectVideo"
        component={ProjectVideo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultProps}
        calculateMetadata={({ props }) => {
          const fps = props.fps ?? 30;
          const totalFrames = (props.scenes ?? []).reduce(
            (acc, s) => acc + Math.max(1, Math.ceil(s.durationSec * fps)),
            0,
          );
          return {
            durationInFrames: Math.max(1, totalFrames),
            fps,
          };
        }}
      />
    </>
  );
};