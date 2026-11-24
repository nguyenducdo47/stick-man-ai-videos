'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ProjectResponse,
  SceneListResponse,
  SceneResponse,
} from '@ai-video-studio/validation';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { ProjectScriptPanel } from '@/components/project-script-panel';
import { SceneGraphPanel } from '@/components/scene-graph-panel';
import { SceneEditorCard } from '@/components/scene-editor-card';
import { StudioShell } from '@/components/studio-shell';
import { Button } from '@/components/ui/button';
import { ApiError, apiFetch } from '@/lib/api';

type StoryboardGenerateResponse = {
  project: ProjectResponse;
  scenes: SceneResponse[];
};

function formatApiError(err: unknown): string {
  if (err instanceof ApiError) {
    const body = err.body as { message?: string | string[] } | undefined;
    if (typeof body?.message === 'string') return body.message;
    return err.message;
  }
  return err instanceof Error ? err.message : 'Request failed';
}

export default function ProjectDetailPage() {
  const params = useParams<{ publicId: string }>();
  const publicId = params.publicId;
  const queryClient = useQueryClient();
  const [synopsis, setSynopsis] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const projectQuery = useQuery({
    queryKey: ['project', publicId],
    queryFn: () => apiFetch<ProjectResponse>(`/v1/projects/${publicId}`),
    enabled: Boolean(publicId),
  });

  const scenesQuery = useQuery({
    queryKey: ['scenes', publicId],
    queryFn: () => apiFetch<SceneListResponse>(`/v1/projects/${publicId}/scenes`),
    enabled: Boolean(publicId),
  });

  const generateStoryboard = useMutation({
    mutationFn: () =>
      apiFetch<StoryboardGenerateResponse>(
        `/v1/projects/${publicId}/ai/storyboard`,
        { method: 'POST', body: JSON.stringify({}) },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['scenes', publicId] });
      void queryClient.invalidateQueries({ queryKey: ['project', publicId] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      void queryClient.invalidateQueries({ queryKey: ['scene-graph', publicId] });
      setAiError(null);
    },
    onError: (err) => setAiError(formatApiError(err)),
  });

  const addScene = useMutation({
    mutationFn: () =>
      apiFetch(`/v1/projects/${publicId}/scenes`, {
        method: 'POST',
        body: JSON.stringify({ title: `Scene ${(scenesQuery.data?.items.length ?? 0) + 1}` }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['scenes', publicId] });
      void queryClient.invalidateQueries({ queryKey: ['project', publicId] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const project = projectQuery.data;

  return (
    <StudioShell
      title={project?.title ?? 'Project'}
      subtitle={project?.topic ?? (projectQuery.isLoading ? 'Loading…' : 'Storyboard editor')}
    >
      {projectQuery.isError ? (
        <p className="text-sm text-red-400">{(projectQuery.error as Error).message}</p>
      ) : null}

      {project ? (
        <>
          <div className="mb-6 flex flex-wrap gap-3 text-xs text-zinc-500">
            <span className="rounded-full border border-zinc-800 px-3 py-1">{project.status}</span>
            <span className="rounded-full border border-zinc-800 px-3 py-1">
              {project.languages.join(' · ')}
            </span>
            <span className="rounded-full border border-zinc-800 px-3 py-1">
              {project.sceneCount} scenes
            </span>
          </div>
          <ProjectScriptPanel project={project} onSynopsis={setSynopsis} />
          {synopsis ? (
            <p className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900/30 px-4 py-3 text-sm text-zinc-400">
              {synopsis}
            </p>
          ) : null}
        </>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-medium">Storyboard</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            className="bg-red-600 hover:bg-red-500"
            disabled={generateStoryboard.isPending || addScene.isPending}
            onClick={() => generateStoryboard.mutate()}
          >
            {generateStoryboard.isPending ? 'Generating storyboard…' : 'Generate storyboard'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-zinc-700"
            disabled={addScene.isPending || generateStoryboard.isPending}
            onClick={() => addScene.mutate()}
          >
            Add scene
          </Button>
        </div>
      </div>
      {aiError ? <p className="mt-3 text-sm text-red-400">{aiError}</p> : null}

      <ul className="mt-6 space-y-6">
        {scenesQuery.data?.items.map((scene) => (
          <li key={scene.publicId}>
            <SceneEditorCard scene={scene} projectPublicId={publicId} />
          </li>
        ))}
      </ul>

      {scenesQuery.data?.items.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-600">
          Add scenes, then edit description, presets, and VI/EN narration. Changes are saved to
          PostgreSQL.
        </p>
      ) : null}

      <div className="mt-10">
        <SceneGraphPanel projectPublicId={publicId} />
      </div>
    </StudioShell>
  );
}