'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import type { DashboardStats, ProjectListResponse } from '@ai-video-studio/validation';

import { StudioShell } from '@/components/studio-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';

export default function DashboardPage() {
  const statsQuery = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiFetch<DashboardStats>('/v1/dashboard/stats'),
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiFetch<ProjectListResponse>('/v1/projects'),
  });

  const stats = statsQuery.data;

  return (
    <StudioShell title="Dashboard" subtitle="Recent projects and studio statistics">
      {statsQuery.isError ? null : stats ? (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Projects" value={stats.projectCount} />
          <StatCard label="Scenes" value={stats.sceneCount} />
          <StatCard label="Draft" value={stats.statusCounts.DRAFT} />
          <StatCard label="Ready" value={stats.statusCounts.READY} />
        </div>
      ) : (
        <p className="mb-8 text-sm text-zinc-600">Loading statistics…</p>
      )}

      {isLoading ? (
        <p className="text-sm text-zinc-500">Loading projects…</p>
      ) : isError ? (
        <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-200">
          Cannot reach API. Start{' '}
          <code className="text-red-100">pnpm --filter @ai-video-studio/api start:dev</code>.{' '}
          {(error as Error).message}
        </div>
      ) : data?.items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-700 p-12 text-center">
          <p className="text-zinc-400">No projects yet.</p>
          <Link href="/projects/new" className="mt-4 inline-block text-sm text-red-400 hover:text-red-300">
            Create your first stickman video →
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {data?.items.map((project) => (
            <li key={project.publicId}>
              <Link
                href={`/projects/${project.publicId}`}
                className="block rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition hover:border-zinc-600"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold">{project.title}</h2>
                  <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs text-zinc-400">
                    {project.status}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-zinc-500">{project.topic}</p>
                <p className="mt-4 text-xs text-zinc-600">
                  {project.sceneCount} scenes · {project.languages.join(', ')}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </StudioShell>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-normal uppercase tracking-wide text-zinc-500">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
