import type { ActionId, Interaction } from '@ai-video-studio/validation';
import React, { Suspense, lazy } from 'react';

import type { HeroGlbLoadedProps } from './hero-glb-loaded.js';
import { ProceduralStickman } from './procedural-stickman.js';
import type { StickmanColors } from './procedural-pose.js';

const HeroGlbLoaded = lazy(() =>
  import('./hero-glb-loaded.js').then((m) => ({ default: m.HeroGlbLoaded })),
);

export function HeroGlbCharacter({
  glbUrl,
  colors,
  actionId,
  actionClips,
  interactions,
  timeSec,
}: {
  glbUrl: string | null;
  colors: StickmanColors;
  actionId?: ActionId;
  actionClips?: { actionId: ActionId; startSec: number; durationSec: number }[];
  interactions?: Interaction[];
  timeSec: number;
}) {
  if (!glbUrl) {
    return (
      <ProceduralStickman
        colors={colors}
        actionId={actionId}
        actionClips={actionClips}
        interactions={interactions}
        timeSec={timeSec}
      />
    );
  }

  const glbProps: HeroGlbLoadedProps = {
    glbUrl,
    colors,
    actionId,
    actionClips,
    interactions,
    timeSec,
  };

  return (
    <Suspense
      fallback={
        <ProceduralStickman
          colors={colors}
          actionId={actionId}
          actionClips={actionClips}
          interactions={interactions}
          timeSec={timeSec}
        />
      }
    >
      <HeroGlbLoaded {...glbProps} />
    </Suspense>
  );
}