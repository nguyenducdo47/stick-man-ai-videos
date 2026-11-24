import React from 'react';
import { AbsoluteFill, Audio, Series, useVideoConfig } from 'remotion';

import { Scene3DShot } from './scene-3d-shot';
import type { RemotionProjectVideoProps } from './types';

export const ProjectVideo: React.FC<RemotionProjectVideoProps> = ({
  projectTitle,
  scenes,
}) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: '#09090b' }}>
      <Series>
        {scenes.map((scene) => {
          const durationInFrames = Math.max(1, Math.ceil(scene.durationSec * fps));
          return (
            <Series.Sequence
              key={scene.scenePublicId}
              durationInFrames={durationInFrames}
            >
              <AbsoluteFill>
                <Scene3DShot
                  animationPreset={scene.animationPreset}
                  cameraPreset={scene.cameraPreset}
                  characterColors={scene.characterColors}
                  environmentId={scene.environmentId}
                  actionClips={scene.actionClips}
                  interactions={scene.interactions}
                  cameraKeyframes={scene.cameraKeyframes}
                  heroGlbSrc={scene.heroGlbSrc}
                  environmentGlbSrc={scene.environmentGlbSrc}
                  sceneLocalTimeSec={0}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: '32px 48px 40px',
                    background:
                      'linear-gradient(transparent, rgba(9,9,11,0.92) 35%, #09090b)',
                    fontFamily: 'system-ui, sans-serif',
                    color: '#f4f4f5',
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{ fontSize: 22, opacity: 0.65, marginBottom: 8 }}>
                    {projectTitle}
                  </div>
                  <h1
                    style={{
                      fontSize: 40,
                      fontWeight: 600,
                      margin: 0,
                      lineHeight: 1.2,
                    }}
                  >
                    {scene.title ?? `Scene ${scene.sortOrder + 1}`}
                  </h1>
                  {scene.subtitleText ? (
                    <p
                      style={{
                        fontSize: 26,
                        marginTop: 16,
                        padding: '12px 16px',
                        background: 'rgba(0,0,0,0.55)',
                        borderRadius: 8,
                        maxWidth: '90%',
                      }}
                    >
                      {scene.subtitleText}
                    </p>
                  ) : (
                    <p style={{ fontSize: 18, opacity: 0.75, marginTop: 10 }}>
                      {scene.animationPreset} · {scene.cameraPreset} ·{' '}
                      {scene.environmentId}
                    </p>
                  )}
                </div>
                <Audio src={scene.audioSrc} />
              </AbsoluteFill>
            </Series.Sequence>
          );
        })}
      </Series>
    </AbsoluteFill>
  );
};