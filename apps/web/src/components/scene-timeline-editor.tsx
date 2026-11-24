'use client';

import {
  ACTION_ID_LIST,
  ENVIRONMENT_ID_LIST,
  INTERACTION_TYPES,
  type ActionClip,
  type Interaction,
  type SceneTimelinePatch,
} from '@ai-video-studio/validation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiFetch } from '@/lib/api';

type TimelineResponse = {
  scenePublicId: string;
  durationSec: number | null;
  config: SceneTimelinePatch;
};

export function SceneTimelineEditor({
  scenePublicId,
  durationSec,
  onSaved,
}: {
  scenePublicId: string;
  durationSec: number;
  onSaved?: () => void;
}) {
  const queryClient = useQueryClient();
  const timelineQuery = useQuery({
    queryKey: ['scene-timeline', scenePublicId],
    queryFn: () =>
      apiFetch<TimelineResponse>(`/v1/scenes/${scenePublicId}/timeline`),
  });

  const [clips, setClips] = useState<ActionClip[]>([
    { actionId: 'idle', startSec: 0, durationSec, blendSec: 0.25 },
  ]);
  const [environmentId, setEnvironmentId] =
    useState<(typeof ENVIRONMENT_ID_LIST)[number]>('studio_grid');
  const [interactions, setInteractions] = useState<Interaction[]>([]);

  useEffect(() => {
    const cfg = timelineQuery.data?.config;
    if (!cfg) return;
    if (cfg.actionClips?.length) setClips(cfg.actionClips);
    if (cfg.environmentId) setEnvironmentId(cfg.environmentId);
    if (cfg.interactions) setInteractions(cfg.interactions);
  }, [timelineQuery.data]);

  const save = useMutation({
    mutationFn: (body: SceneTimelinePatch) =>
      apiFetch<TimelineResponse>(`/v1/scenes/${scenePublicId}/timeline`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['scene-timeline', scenePublicId] });
      void queryClient.invalidateQueries({ queryKey: ['scene-graph'] });
      onSaved?.();
    },
  });

  return (
    <div className="mt-4 space-y-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-sm">
      <span className="font-medium text-zinc-300">Timeline (Phase 6.6)</span>

      <div className="grid gap-2">
        <Label className="text-xs text-zinc-500">Environment</Label>
        <select
          className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-200"
          value={environmentId}
          onChange={(e) =>
            setEnvironmentId(e.target.value as (typeof ENVIRONMENT_ID_LIST)[number])
          }
        >
          {ENVIRONMENT_ID_LIST.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </div>

      <ul className="space-y-2">
        {clips.map((clip, i) => (
          <li key={i} className="flex flex-wrap items-end gap-2 border-t border-zinc-800 pt-2">
            <MotionControls
              clip={clip}
              onChange={(next) => {
                const copy = [...clips];
                copy[i] = next;
                setClips(copy);
              }}
            />
            {clips.length > 1 ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-zinc-700"
                onClick={() => setClips(clips.filter((_, j) => j !== i))}
              >
                Remove
              </Button>
            ) : null}
          </li>
        ))}
      </ul>

      <Button
        type="button"
        size="sm"
        variant="outline"
        className="border-zinc-700"
        onClick={() =>
          setClips([
            ...clips,
            {
              actionId: 'idle',
              startSec: clips.reduce((m, c) => Math.max(m, c.startSec + c.durationSec), 0),
              durationSec: 2,
              blendSec: 0.25,
            },
          ])
        }
      >
        Add action clip
      </Button>

      <div className="border-t border-zinc-800 pt-2">
        <Label className="text-xs text-zinc-500">Interaction (one MVP)</Label>
        {interactions.length === 0 ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-1 border-zinc-700"
            onClick={() =>
              setInteractions([
                {
                  id: 'walk-main',
                  type: 'walk_to',
                  startSec: 0,
                  durationSec: Math.min(3, durationSec),
                  targetPosition: [1.5, 0, 2],
                },
              ])
            }
          >
            Add walk_to
          </Button>
        ) : (
          interactions.map((ix, i) => (
            <div key={ix.id} className="mt-2 flex flex-wrap gap-2 text-xs">
              <select
                className="rounded border border-zinc-700 bg-zinc-900 px-1 py-0.5"
                value={ix.type}
                onChange={(e) => {
                  const copy = [...interactions];
                  copy[i] = { ...ix, type: e.target.value as Interaction['type'] };
                  setInteractions(copy);
                }}
              >
                {INTERACTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <Input
                type="number"
                step="0.1"
                className="h-7 w-16"
                value={ix.startSec}
                onChange={(e) => {
                  const copy = [...interactions];
                  copy[i] = { ...ix, startSec: Number(e.target.value) };
                  setInteractions(copy);
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setInteractions(interactions.filter((_, j) => j !== i))}
              >
                ×
              </Button>
            </div>
          ))
        )}
      </div>

      <Button
        type="button"
        className="bg-red-600 hover:bg-red-500"
        disabled={save.isPending}
        onClick={() =>
          save.mutate({
            actionClips: clips,
            environmentId,
            interactions,
          })
        }
      >
        {save.isPending ? 'Saving timeline…' : 'Save timeline'}
      </Button>
    </div>
  );
}

function MotionControls({
  clip,
  onChange,
}: {
  clip: ActionClip;
  onChange: (c: ActionClip) => void;
}) {
  return (
    <>
      <div>
        <Label className="text-xs text-zinc-500">Action</Label>
        <select
          className="block rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-zinc-200"
          value={clip.actionId}
          onChange={(e) =>
            onChange({ ...clip, actionId: e.target.value as ActionClip['actionId'] })
          }
        >
          {ACTION_ID_LIST.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label className="text-xs text-zinc-500">Start (s)</Label>
        <Input
          type="number"
          step="0.1"
          className="h-8 w-20"
          value={clip.startSec}
          onChange={(e) => onChange({ ...clip, startSec: Number(e.target.value) })}
        />
      </div>
      <div>
        <Label className="text-xs text-zinc-500">Duration (s)</Label>
        <Input
          type="number"
          step="0.1"
          className="h-8 w-20"
          value={clip.durationSec}
          onChange={(e) =>
            onChange({ ...clip, durationSec: Number(e.target.value) })
          }
        />
      </div>
    </>
  );
}