'use client';

import { ENVIRONMENT_PRESETS } from '@ai-video-studio/animation-engine';
import type { StudioAssetsStatusResponse } from '@ai-video-studio/validation';
import { useQuery } from '@tanstack/react-query';

import { StudioShell } from '@/components/studio-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchStudioAssetsStatus } from '@/lib/studio-assets';

function formatBytes(n: number | null | undefined): string {
  if (n == null) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function AssetTable({ data }: { data: StudioAssetsStatusResponse }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-800 bg-zinc-900/80 text-xs uppercase text-zinc-500">
          <tr>
            <th className="px-4 py-3">Asset</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Size</th>
            <th className="px-4 py-3">License</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((row) => {
            const label =
              row.kind === 'environment' && row.environmentId
                ? (ENVIRONMENT_PRESETS[row.environmentId]?.label ?? row.environmentId)
                : row.id;
            return (
              <tr key={row.id} className="border-b border-zinc-800/80">
                <td className="px-4 py-3 text-zinc-200">
                  {label}
                  {row.path ? (
                    <p className="mt-0.5 font-mono text-xs text-zinc-500">{row.path}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      row.installed
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }
                  >
                    {row.installed ? 'Installed' : 'Procedural fallback'}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-400">{formatBytes(row.bytes ?? null)}</td>
                <td className="px-4 py-3 text-zinc-500">{row.license ?? '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function AssetsSettingsPage() {
  const statusQuery = useQuery({
    queryKey: ['studio-assets-status'],
    queryFn: fetchStudioAssetsStatus,
    refetchInterval: 60_000,
  });

  return (
    <StudioShell
      title="3D assets"
      subtitle="Phase 7 — registry under data/studio/assets.v1.json"
    >
      <Card className="border-zinc-800 bg-zinc-950/50">
        <CardHeader>
          <CardTitle className="text-base">Onboarding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-zinc-400">
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              List manifest:{' '}
              <code className="text-zinc-300">node scripts/install-cc0-glb-assets.mjs --list</code>
            </li>
            <li>
              Smoke-test only (small Khronos samples):{' '}
              <code className="text-zinc-300">
                node scripts/install-cc0-glb-assets.mjs --smoke-test
              </code>
            </li>
            <li>
              Or copy licensed CC0 GLB files into{' '}
              <code className="text-zinc-300">data/assets/characters</code> and{' '}
              <code className="text-zinc-300">data/assets/environments/</code>
            </li>
          </ol>
          <p className="text-xs text-zinc-600">
            Illustration environments always render even when GLB is missing. GLB layers
            enhance fidelity when installed.
          </p>
        </CardContent>
      </Card>

      <div className="mt-8">
        {statusQuery.isLoading ? (
          <p className="text-sm text-zinc-500">Loading asset probe…</p>
        ) : null}
        {statusQuery.error ? (
          <p className="text-sm text-red-400">Could not load /v1/assets/status</p>
        ) : null}
        {statusQuery.data ? (
          <>
            <p className="mb-3 text-xs text-zinc-500">
              Registry v{statusQuery.data.registryVersion} · refreshed via disk probe
            </p>
            <AssetTable data={statusQuery.data} />
          </>
        ) : null}
      </div>
    </StudioShell>
  );
}