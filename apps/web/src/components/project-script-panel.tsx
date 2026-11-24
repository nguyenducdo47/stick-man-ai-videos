'use client';

import type { ProjectResponse } from '@ai-video-studio/validation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ApiError, apiFetch } from '@/lib/api';

type ScriptGenerateResponse = {
  project: ProjectResponse;
  synopsis: string | null;
};

function formatApiError(err: unknown): string {
  if (err instanceof ApiError) {
    const body = err.body as { message?: string | string[] } | undefined;
    if (typeof body?.message === 'string') return body.message;
    if (Array.isArray(body?.message)) return body.message.join(', ');
    return err.message;
  }
  return err instanceof Error ? err.message : 'Request failed';
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export function ProjectScriptPanel({
  project,
  onSynopsis,
}: {
  project: ProjectResponse;
  onSynopsis?: (text: string | null) => void;
}) {
  const queryClient = useQueryClient();
  const [scriptDraft, setScriptDraft] = useState(project.scriptDraft ?? '');
  const [error, setError] = useState<string | null>(null);
  const [generateStartedAt, setGenerateStartedAt] = useState<number | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    setScriptDraft(project.scriptDraft ?? '');
  }, [project.scriptDraft]);

  useEffect(() => {
    if (generateStartedAt == null) return;
    const id = window.setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - generateStartedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [generateStartedAt]);

  const save = useMutation({
    mutationFn: (draft: string) =>
      apiFetch<ProjectResponse>(`/v1/projects/${project.publicId}`, {
        method: 'PATCH',
        body: JSON.stringify({ scriptDraft: draft }),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['project', project.publicId] });
      setError(null);
    },
    onError: (err) => setError(formatApiError(err)),
  });

  const generate = useMutation({
    mutationFn: async () => {
      const draft = scriptDraft.trim();
      if (draft.length > 0) {
        await apiFetch<ProjectResponse>(`/v1/projects/${project.publicId}`, {
          method: 'PATCH',
          body: JSON.stringify({ scriptDraft: draft }),
        });
      }
      return apiFetch<ScriptGenerateResponse>(`/v1/projects/${project.publicId}/ai/script`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
    },
    onMutate: () => {
      setGenerateStartedAt(Date.now());
      setElapsedSec(0);
      setError(null);
    },
    onSuccess: (data) => {
      setScriptDraft(data.project.scriptDraft ?? '');
      onSynopsis?.(data.synopsis);
      void queryClient.invalidateQueries({ queryKey: ['project', project.publicId] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setError(null);
      setGenerateStartedAt(null);
    },
    onError: (err) => {
      setError(formatApiError(err));
      setGenerateStartedAt(null);
    },
  });

  const busy = save.isPending || generate.isPending;
  const looksLikeFullScript = /scene\s*\d+/i.test(scriptDraft) && scriptDraft.length > 200;

  return (
    <Card className="mb-8 border-zinc-800 bg-zinc-900/40">
      <CardHeader>
        <CardTitle className="text-base">Script draft</CardTitle>
        <p className="text-xs text-zinc-500">
          <strong className="text-zinc-400">Generate script</strong> gọi Ollama từ Title + Topic của project, kèm
          nội dung ô này (tự lưu trước khi gọi). qwen3:4b thường mất{' '}
          <strong className="text-zinc-400">2–5 phút</strong> (máy chậm hơn nếu không GPU). Đã có kịch bản đủ Scene →{' '}
          <strong className="text-zinc-400">Save script</strong> rồi dùng Generate storyboard.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Label htmlFor="script-draft" className="sr-only">
          Script
        </Label>
        <Textarea
          id="script-draft"
          rows={6}
          value={scriptDraft}
          onChange={(e) => setScriptDraft(e.target.value)}
          placeholder="Gợi ý ngắn hoặc kịch bản đầy đủ. Generate script mở rộng gợi ý; brief nên khớp Topic khi tạo project."
          className="border-zinc-700 bg-zinc-950 font-mono text-sm"
          disabled={busy}
        />
        {generate.isPending ? (
          <p className="text-sm text-amber-300/90">
            Đang gọi Ollama… {formatElapsed(elapsedSec)} — xem terminal API nếu quá 10 phút.
          </p>
        ) : null}
        {looksLikeFullScript && !generate.isPending ? (
          <p className="text-xs text-zinc-500">
            Ô script đã giống kịch bản đủ cảnh — không cần Generate script; Save rồi Generate storyboard.
          </p>
        ) : null}
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={busy}
          onClick={() => generate.mutate()}
          className="bg-red-600 hover:bg-red-500"
        >
          {generate.isPending ? `Generating script… ${formatElapsed(elapsedSec)}` : 'Generate script'}
        </Button>
        <Button
          type="button"
          disabled={busy}
          onClick={() => save.mutate(scriptDraft)}
          variant="secondary"
        >
          {save.isPending ? 'Saving…' : 'Save script'}
        </Button>
      </CardFooter>
    </Card>
  );
}