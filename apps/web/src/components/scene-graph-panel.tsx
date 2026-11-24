'use client';

import type { SceneGraphV2Response } from '@ai-video-studio/validation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiError, apiFetch } from '@/lib/api';

import { SceneTimelineEditor } from '@/components/scene-timeline-editor';

const SceneGraphCanvas = dynamic(
  () => import('./scene-graph-canvas').then((m) => m.SceneGraphCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-72 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-sm text-zinc-500">
        Loading 3D preview…
      </div>
    ),
  },
);

function formatApiError(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  return err instanceof Error ? err.message : 'Request failed';
}

export function SceneGraphPanel({ projectPublicId }: { projectPublicId: string }) {
  const queryClient = useQueryClient();
  const [sceneIndex, setSceneIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const graphQuery = useQuery({
    queryKey: ['scene-graph', projectPublicId],
    queryFn: () =>
      apiFetch<SceneGraphV2Response>(`/v1/projects/${projectPublicId}/scene-graph-v2`),
    enabled: Boolean(projectPublicId),
  });

  const saveGraph = useMutation({
    mutationFn: () =>
      apiFetch<SceneGraphV2Response>(
        `/v1/projects/${projectPublicId}/scene-graph-v2/compile`,
        { method: 'POST', body: '{}' },
      ),
    onSuccess: (data) => {
      queryClient.setQueryData(['scene-graph', projectPublicId], data);
      setError(null);
    },
    onError: (err) => setError(formatApiError(err)),
  });

  const graph = graphQuery.data?.graph;
  const sceneCount = graph?.scenes.length ?? 0;

  return (
    <Card className="mb-8 border-zinc-800 bg-zinc-900/40">
      <CardHeader>
        <CardTitle className="text-base">3D scene graph v2</CardTitle>
        <p className="text-xs text-zinc-500">
          Compiles storyboard scenes into a shared stickman timeline (data under{' '}
          <code className="text-zinc-400">data/projects/</code>). Preview uses Three.js locally.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {graphQuery.isError ? (
          <p className="text-sm text-red-400">{(graphQuery.error as Error).message}</p>
        ) : null}
        {graphQuery.isLoading ? (
          <p className="text-sm text-zinc-500">Compiling scene graph…</p>
        ) : null}
        {graph && sceneCount > 0 ? (
          <>
            <div className="flex flex-wrap gap-2">
              {graph.scenes.map((s, i) => (
                <Button
                  key={s.scenePublicId}
                  type="button"
                  size="sm"
                  variant={i === sceneIndex ? 'default' : 'outline'}
                  className={i === sceneIndex ? 'bg-red-600 hover:bg-red-500' : 'border-zinc-700'}
                  onClick={() => setSceneIndex(i)}
                >
                  {s.title ?? `Scene ${i + 1}`}
                </Button>
              ))}
            </div>
            <SceneGraphCanvas graph={graph} sceneIndex={sceneIndex} />
            <SceneTimelineEditor
              scenePublicId={graph.scenes[sceneIndex]!.scenePublicId}
              durationSec={graph.scenes[sceneIndex]!.durationSec}
              onSaved={() => {
                void queryClient.invalidateQueries({
                  queryKey: ['scene-graph', projectPublicId],
                });
              }}
            />
            <p className="text-xs text-zinc-500">
              Total ~{graph.totalDurationSec}s · style {graph.visualStyle}
              {graphQuery.data?.savedPath
                ? ` · on disk: ${graphQuery.data.savedPath}`
                : ' · preview only — click Save graph to data/'}
            </p>
          </>
        ) : graph && sceneCount === 0 ? (
          <p className="text-sm text-zinc-500">
            Add or generate storyboard scenes first, then refresh.
          </p>
        ) : null}
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={graphQuery.isFetching}
          onClick={() => {
            void queryClient.invalidateQueries({ queryKey: ['scene-graph', projectPublicId] });
          }}
        >
          Refresh graph
        </Button>
        <Button
          type="button"
          className="bg-red-600 hover:bg-red-500"
          disabled={saveGraph.isPending || sceneCount === 0}
          onClick={() => saveGraph.mutate()}
        >
          {saveGraph.isPending ? 'Saving…' : 'Save graph to data/'}
        </Button>
      </CardFooter>
    </Card>
  );
}