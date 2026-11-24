'use client';

import { useQuery } from '@tanstack/react-query';

import { StudioShell } from '@/components/studio-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';

type OllamaStatus =
  | {
      reachable: true;
      models: string[];
      defaultModel: string;
      defaultModelAvailable?: boolean;
      error?: string;
    }
  | {
      reachable: false;
      error?: string;
      models: string[];
      defaultModel: string;
    };

export default function AiSettingsPage() {
  const statusQuery = useQuery({
    queryKey: ['ollama-status'],
    queryFn: () => apiFetch<OllamaStatus>('/v1/ollama/status'),
    refetchInterval: 30_000,
  });

  const data = statusQuery.data;

  return (
    <StudioShell title="AI / Ollama" subtitle="Local LLM status for script and storyboard generation">
      {statusQuery.isError ? (
        <p className="text-sm text-red-400">{(statusQuery.error as Error).message}</p>
      ) : null}

      <Card className="border-zinc-800 bg-zinc-900/40">
        <CardHeader>
          <CardTitle className="text-base">Ollama</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-zinc-300">
          {statusQuery.isLoading ? <p className="text-zinc-500">Checking…</p> : null}
          {data ? (
            <>
              <p>
                Reachable:{' '}
                <span className={data.reachable ? 'text-emerald-400' : 'text-red-400'}>
                  {data.reachable ? 'yes' : 'no'}
                </span>
              </p>
              {data.error ? <p className="text-amber-400">{data.error}</p> : null}
              <p>
                Default model: <code className="text-zinc-400">{data.defaultModel}</code>
                {'reachable' in data && data.reachable && 'defaultModelAvailable' in data ? (
                  <span className={data.defaultModelAvailable ? ' text-emerald-400' : ' text-red-400'}>
                    {data.defaultModelAvailable ? ' (installed)' : ' (missing — run ollama pull)'}
                  </span>
                ) : null}
              </p>
              {data.reachable && data.models.length > 0 ? (
                <ul className="list-inside list-disc text-zinc-500">
                  {data.models.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : null}
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-zinc-600">
        Generation uses structured JSON from Ollama. Install{' '}
        <code className="text-zinc-500">qwen3:4b</code> before using Generate script on a project.
      </p>
    </StudioShell>
  );
}