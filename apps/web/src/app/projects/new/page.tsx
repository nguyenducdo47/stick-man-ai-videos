'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { createProjectSchema, type CreateProjectInput } from '@ai-video-studio/validation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import type { ProjectResponse } from '@ai-video-studio/validation';

import { StudioShell } from '@/components/studio-shell';
import { apiFetch } from '@/lib/api';

export default function NewProjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: '',
      topic: '',
      languages: ['vi', 'en'],
      targetSceneCount: 5,
      targetDurationSec: 120,
      visualStyle: 'stickman-red-hoodie',
    },
  });

  const mutation = useMutation({
    mutationFn: (input: CreateProjectInput) =>
      apiFetch<ProjectResponse>('/v1/projects', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: (project) => {
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      router.push(`/projects/${project.publicId}`);
    },
  });

  return (
    <StudioShell title="New project" subtitle="Topic, duration, and languages for VI / EN exports">
      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="max-w-xl space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8"
      >
        <div>
          <label className="text-sm text-zinc-400">Title</label>
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            {...register('title')}
          />
          {errors.title ? <p className="mt-1 text-xs text-red-400">{errors.title.message}</p> : null}
        </div>
        <div>
          <label className="text-sm text-zinc-400">Topic</label>
          <textarea
            rows={4}
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            {...register('topic')}
          />
          {errors.topic ? <p className="mt-1 text-xs text-red-400">{errors.topic.message}</p> : null}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-zinc-400">Target duration (sec)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              {...register('targetDurationSec', { valueAsNumber: true })}
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400">Scene count</label>
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              {...register('targetSceneCount', { valueAsNumber: true })}
            />
          </div>
        </div>
        <div>
          <label className="text-sm text-zinc-400">Visual style</label>
          <input
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            {...register('visualStyle')}
          />
        </div>
        <p className="text-sm text-zinc-500">
          Languages: <strong className="text-zinc-300">Vietnamese + English</strong> (shared visuals, separate
          narration in Phase 2).
        </p>
        {mutation.isError ? (
          <p className="text-sm text-red-400">{(mutation.error as Error).message}</p>
        ) : null}
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
        >
          {mutation.isPending ? 'Creating…' : 'Create project'}
        </button>
      </form>
    </StudioShell>
  );
}