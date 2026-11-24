import type { EnvironmentId } from '@ai-video-studio/validation';
import React, { Suspense, lazy } from 'react';

const EnvironmentGlbLoaded = lazy(() =>
  import('./environment-glb-loaded.js').then((m) => ({
    default: m.EnvironmentGlbLoaded,
  })),
);

export function EnvironmentGlbScene({
  glbUrl,
  environmentId,
}: {
  glbUrl: string;
  environmentId: EnvironmentId;
}) {
  return (
    <Suspense fallback={null}>
      <EnvironmentGlbLoaded glbUrl={glbUrl} environmentId={environmentId} />
    </Suspense>
  );
}