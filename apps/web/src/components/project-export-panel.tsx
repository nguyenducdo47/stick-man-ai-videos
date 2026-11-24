'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ProjectRenderListResponse,
  ProjectRenderResponse,
  RenderStatusResponse,
} from '@ai-video-studio/validation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { apiAssetUrlVersioned, apiFetch, ApiError } from '@/lib/api';

type Props = {
  projectPublicId: string;
  languages: string[];
};

function formatApiError(err: unknown): string {
  if (err instanceof ApiError) {
    const body = err.body as { message?: string | string[] } | undefined;
    if (typeof body?.message === 'string') return body.message;
    if (Array.isArray(body?.message)) return body.message.join('; ');
    return err.message;
  }
  return err instanceof Error ? err.message : 'Request failed';
}

export function ProjectExportPanel({ projectPublicId, languages }: Props) {
  const queryClient = useQueryClient();
  const [renderError, setRenderError] = useState<string | null>(null);
  const [activeLocale, setActiveLocale] = useState<string | null>(null);

  const statusQuery = useQuery({
    queryKey: ['render-status'],
    queryFn: () => apiFetch<RenderStatusResponse>('/v1/render/status'),
  });

  const rendersQuery = useQuery({
    queryKey: ['project-renders', projectPublicId],
    queryFn: () =>
      apiFetch<ProjectRenderListResponse>(
        `/v1/projects/${projectPublicId}/renders`,
      ),
    enabled: Boolean(projectPublicId),
  });

  const renderLocale = useMutation({
    mutationFn: (locale: string) => {
      setActiveLocale(locale);
      return apiFetch<ProjectRenderResponse>(
        `/v1/projects/${projectPublicId}/render`,
        {
          method: 'POST',
          body: JSON.stringify({ locale }),
        },
      );
    },
    onSuccess: () => {
      setRenderError(null);
      void queryClient.invalidateQueries({
        queryKey: ['project-renders', projectPublicId],
      });
    },
    onError: (err) => {
      setRenderError(formatApiError(err));
      void queryClient.invalidateQueries({
        queryKey: ['project-renders', projectPublicId],
      });
    },
    onSettled: () => setActiveLocale(null),
  });

  const ffmpegOk = statusQuery.data?.ffmpegAvailable === true;
  const items = rendersQuery.data?.items ?? [];

  return (
    <section className="mt-10 rounded-xl border border-zinc-800 bg-zinc-950/40 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium">Export video</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Remotion 3D stickman + narration → MP4 under{' '}
            <code className="text-zinc-400">data/renders/</code>
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs ${
            ffmpegOk
              ? 'border-emerald-900 text-emerald-400'
              : 'border-amber-900 text-amber-400'
          }`}
        >
          FFmpeg {ffmpegOk ? 'ready' : 'missing'}
        </span>
      </div>

      {!ffmpegOk && statusQuery.data?.error ? (
        <p className="mt-3 text-sm text-amber-400">{statusQuery.data.error}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {languages.map((locale) => (
          <Button
            key={locale}
            type="button"
            variant="outline"
            className="border-zinc-700"
            disabled={
              !ffmpegOk ||
              renderLocale.isPending ||
              statusQuery.isLoading
            }
            onClick={() => renderLocale.mutate(locale)}
          >
            {renderLocale.isPending && activeLocale === locale
              ? `Rendering ${locale.toUpperCase()}…`
              : `Render ${locale.toUpperCase()} MP4`}
          </Button>
        ))}
      </div>

      {renderError ? (
        <p className="mt-3 text-sm text-red-400">{renderError}</p>
      ) : null}

      {items.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {items.map((item) => (
            <li
              key={item.locale}
              className="rounded-lg border border-zinc-800 px-4 py-3 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium uppercase text-zinc-300">
                  {item.locale}
                </span>
                <span
                  className={
                    item.status === 'SUCCESS'
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }
                >
                  {item.status}
                </span>
              </div>
              {item.status === 'SUCCESS' && item.videoUrl ? (
                <video
                  className="mt-3 w-full max-w-2xl rounded-md border border-zinc-800"
                  controls
                  preload="metadata"
                  src={apiAssetUrlVersioned(
                    item.videoUrl,
                    item.renderedAt,
                  )}
                />
              ) : null}
              {item.errorMessage ? (
                <p className="mt-2 text-xs text-red-400">{item.errorMessage}</p>
              ) : null}
              {item.durationSec != null ? (
                <p className="mt-1 text-xs text-zinc-500">
                  {item.sceneCount ?? 0} scenes · {item.durationSec.toFixed(1)}s
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-zinc-600">
          Generate TTS for all scenes, then export a locale.
        </p>
      )}
    </section>
  );
}