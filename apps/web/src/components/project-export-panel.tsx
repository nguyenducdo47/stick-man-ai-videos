'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ProjectRenderListResponse,
  ProjectRenderResponse,
  RenderJobResponse,
  RenderStatusResponse,
} from '@ai-video-studio/validation';
import { RENDER_QUALITY_MODES } from '@ai-video-studio/validation';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { apiAssetUrlVersioned, apiFetch, ApiError } from '@/lib/api';

type Props = {
  projectPublicId: string;
  languages: string[];
};

type RenderQuality = (typeof RENDER_QUALITY_MODES)[number];

function formatApiError(err: unknown): string {
  if (err instanceof ApiError) {
    const body = err.body as { message?: string | string[] } | undefined;
    if (typeof body?.message === 'string') return body.message;
    if (Array.isArray(body?.message)) return body.message.join('; ');
    return err.message;
  }
  return err instanceof Error ? err.message : 'Request failed';
}

function isRenderJob(
  body: ProjectRenderResponse | RenderJobResponse,
): body is RenderJobResponse {
  return 'jobId' in body && typeof body.jobId === 'string';
}

export function ProjectExportPanel({ projectPublicId, languages }: Props) {
  const queryClient = useQueryClient();
  const [renderError, setRenderError] = useState<string | null>(null);
  const [activeLocale, setActiveLocale] = useState<string | null>(null);
  const [asyncRender, setAsyncRender] = useState(true);
  const [quality, setQuality] = useState<RenderQuality>('standard');
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<RenderJobResponse | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearPoll = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => () => clearPoll(), []);

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

  const pollJob = (id: string) => {
    clearPoll();
    pollRef.current = setInterval(() => {
      void (async () => {
        try {
          const job = await apiFetch<RenderJobResponse>(
            `/v1/render/jobs/${encodeURIComponent(id)}`,
          );
          setJobStatus(job);
          if (
            job.status === 'completed' ||
            job.status === 'failed' ||
            job.status === 'cancelled'
          ) {
            clearPoll();
            setJobId(null);
            setActiveLocale(null);
            void queryClient.invalidateQueries({
              queryKey: ['project-renders', projectPublicId],
            });
            if (job.status === 'failed' && job.errorMessage) {
              setRenderError(job.errorMessage);
            }
          }
        } catch (err) {
          clearPoll();
          setRenderError(formatApiError(err));
          setActiveLocale(null);
        }
      })();
    }, 1500);
  };

  const renderLocale = useMutation({
    mutationFn: (locale: string) => {
      setActiveLocale(locale);
      setRenderError(null);
      setJobStatus(null);
      void queryClient.invalidateQueries({
        queryKey: ['project-renders', projectPublicId],
      });
      return apiFetch<ProjectRenderResponse | RenderJobResponse>(
        `/v1/projects/${projectPublicId}/render`,
        {
          method: 'POST',
          body: JSON.stringify({
            locale,
            async: asyncRender,
            quality,
          }),
        },
      );
    },
    onSuccess: (data) => {
      if (isRenderJob(data)) {
        setJobId(data.jobId);
        setJobStatus(data);
        pollJob(data.jobId);
        return;
      }
      setRenderError(null);
      void queryClient.invalidateQueries({
        queryKey: ['project-renders', projectPublicId],
      });
      setActiveLocale(null);
    },
    onError: (err) => {
      setRenderError(formatApiError(err));
      void queryClient.invalidateQueries({
        queryKey: ['project-renders', projectPublicId],
      });
      setActiveLocale(null);
    },
  });

  const ffmpegOk = statusQuery.data?.ffmpegAvailable === true;
  const items = rendersQuery.data?.items ?? [];
  const rendering =
    renderLocale.isPending ||
    (jobId != null &&
      jobStatus != null &&
      jobStatus.status !== 'completed' &&
      jobStatus.status !== 'failed' &&
      jobStatus.status !== 'cancelled');

  const cancelJob = useMutation({
    mutationFn: (id: string) =>
      apiFetch<{ cancelled: boolean; jobId: string }>(
        `/v1/render/jobs/${encodeURIComponent(id)}`,
        { method: 'DELETE' },
      ),
    onSuccess: () => {
      clearPoll();
      setJobId(null);
      setActiveLocale(null);
      setJobStatus((prev) =>
        prev
          ? { ...prev, status: 'cancelled', errorMessage: 'Cancelled by user' }
          : null,
      );
    },
    onError: (err) => setRenderError(formatApiError(err)),
  });

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

      <p className="mt-2 text-xs text-zinc-600">
        Nếu render báo EPERM trên Windows: đóng tab preview video (player đang giữ file{' '}
        <code className="text-zinc-500">.mp4</code>) rồi thử lại.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-zinc-400">
          <input
            type="checkbox"
            className="rounded border-zinc-600"
            checked={asyncRender}
            onChange={(e) => setAsyncRender(e.target.checked)}
          />
          Queue via Redis (worker)
        </label>
        <label className="flex items-center gap-2 text-zinc-400">
          Quality
          <select
            className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-200"
            value={quality}
            onChange={(e) => setQuality(e.target.value as RenderQuality)}
          >
            {RENDER_QUALITY_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {mode}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {languages.map((locale) => (
          <Button
            key={locale}
            type="button"
            variant="outline"
            className="border-zinc-700"
            disabled={!ffmpegOk || rendering || statusQuery.isLoading}
            onClick={() => renderLocale.mutate(locale)}
          >
            {rendering && activeLocale === locale
              ? asyncRender && jobStatus
                ? `Queue ${locale.toUpperCase()}… ${jobStatus.progress ?? 0}%`
                : `Rendering ${locale.toUpperCase()}…`
              : `Render ${locale.toUpperCase()} MP4`}
          </Button>
        ))}
      </div>

      {asyncRender ? (
        <p className="mt-2 text-xs text-zinc-600">
          Bật Redis (Laragon) và chạy{' '}
          <code className="text-zinc-500">pnpm --filter @ai-video-studio/worker dev</code>{' '}
          trong terminal riêng.
        </p>
      ) : null}

      {jobStatus && jobId ? (
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
          <span>
            Job {jobId.slice(0, 24)}… — {jobStatus.status}
            {jobStatus.progress != null ? ` (${jobStatus.progress}%)` : null}
          </span>
          {jobStatus.status === 'queued' || jobStatus.status === 'active' ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-red-900 text-red-400 hover:bg-red-950"
              disabled={cancelJob.isPending}
              onClick={() => cancelJob.mutate(jobId)}
            >
              Cancel job
            </Button>
          ) : null}
        </div>
      ) : null}

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