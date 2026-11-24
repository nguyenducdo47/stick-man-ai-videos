'use client';

import { ENVIRONMENT_PRESETS } from '@ai-video-studio/animation-engine';
import { PreviewStickmanCanvas } from '@ai-video-studio/stickman-renderer';
import type { SceneGraphV2Document } from '@ai-video-studio/validation';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import {
  fetchStudioAssetsStatus,
  resolveEnvGlbFromStatus,
  resolveHeroGlbFromStatus,
} from '@/lib/studio-assets';

export function SceneGraphCanvas({
  graph,
  sceneIndex,
}: {
  graph: SceneGraphV2Document;
  sceneIndex: number;
}) {
  const scene = graph.scenes[sceneIndex] ?? graph.scenes[0];
  const [scrubSec, setScrubSec] = useState(0);

  const assetStatus = useQuery({
    queryKey: ['studio-assets-status'],
    queryFn: fetchStudioAssetsStatus,
    staleTime: 60_000,
  });

  if (!scene) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-sm text-zinc-500">
        No scenes to preview
      </div>
    );
  }

  const envLabel = ENVIRONMENT_PRESETS[scene.environmentId]?.label ?? scene.environmentId;

  return (
    <div>
      <h3 className="sr-only">3D preview scene {sceneIndex + 1}</h3>
      <PreviewStickmanCanvas
        environmentId={scene.environmentId}
        cameraPreset={scene.cameraPreset}
        colors={graph.character.colors}
        actionClips={scene.actionClips}
        interactions={scene.interactions}
        cameraKeyframes={scene.cameraKeyframes}
        heroGlbUrl={resolveHeroGlbFromStatus(assetStatus.data)}
        environmentGlbUrl={resolveEnvGlbFromStatus(
          assetStatus.data,
          scene.environmentId,
        )}
        previewTimeSec={scrubSec}
      />
      <label className="mt-3 flex items-center gap-3 text-xs text-zinc-400">
        Scrub {scrubSec.toFixed(1)}s / {scene.durationSec}s
        <input
          type="range"
          min={0}
          max={scene.durationSec}
          step={0.05}
          value={scrubSec}
          className="flex-1"
          onChange={(e) => setScrubSec(Number(e.target.value))}
        />
      </label>
      <p className="mt-2 text-xs text-zinc-500">
        {scene.title ?? `Scene ${scene.sortOrder + 1}`} · {scene.actionClips.length} clip(s) ·{' '}
        {scene.cameraPreset} · {envLabel}
      </p>
    </div>
  );
}