'use client';

import type {
  SceneResponse,
  SceneTtsResponse,
  TtsPreferencesResponse,
  UpdateSceneInput,
} from '@ai-video-studio/validation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiAssetUrlVersioned, apiFetch } from '@/lib/api';

type LocaleKey = 'vi' | 'en';

export function SceneEditorCard({
  scene,
  projectPublicId,
}: {
  scene: SceneResponse;
  projectPublicId: string;
}) {
  const queryClient = useQueryClient();

  const ttsPrefsQuery = useQuery({
    queryKey: ['tts-preferences'],
    queryFn: () => apiFetch<TtsPreferencesResponse>('/v1/tts/preferences'),
    staleTime: 10_000,
  });
  const korvaVoiceVi = ttsPrefsQuery.data?.korvaVoiceVi;
  const [title, setTitle] = useState(scene.title ?? '');
  const [description, setDescription] = useState(scene.description ?? '');
  const [characterAction, setCharacterAction] = useState(scene.characterAction ?? '');
  const [animationPreset, setAnimationPreset] = useState(scene.animationPreset ?? '');
  const [cameraPreset, setCameraPreset] = useState(scene.cameraPreset ?? '');
  const [durationSec, setDurationSec] = useState(
    scene.durationSec != null ? String(scene.durationSec) : '',
  );
  const [narration, setNarration] = useState<Record<LocaleKey, string>>({
    vi: scene.localizations.find((l) => l.locale === 'vi')?.narration ?? '',
    en: scene.localizations.find((l) => l.locale === 'en')?.narration ?? '',
  });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setTitle(scene.title ?? '');
    setDescription(scene.description ?? '');
    setCharacterAction(scene.characterAction ?? '');
    setAnimationPreset(scene.animationPreset ?? '');
    setCameraPreset(scene.cameraPreset ?? '');
    setDurationSec(scene.durationSec != null ? String(scene.durationSec) : '');
    setNarration({
      vi: scene.localizations.find((l) => l.locale === 'vi')?.narration ?? '',
      en: scene.localizations.find((l) => l.locale === 'en')?.narration ?? '',
    });
  }, [scene]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['scenes', projectPublicId] });
    void queryClient.invalidateQueries({ queryKey: ['project', projectPublicId] });
    void queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
  };

  const saveScene = useMutation({
    mutationFn: (body: UpdateSceneInput) =>
      apiFetch<SceneResponse>(`/v1/scenes/${scene.publicId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      setMessage('Scene saved');
      invalidate();
    },
    onError: (err) => setMessage((err as Error).message),
  });

  const saveLocale = useMutation({
    mutationFn: ({ locale, text }: { locale: LocaleKey; text: string }) =>
      apiFetch(`/v1/scenes/${scene.publicId}/localizations/${locale}`, {
        method: 'PATCH',
        body: JSON.stringify({ narration: text }),
      }),
    onSuccess: () => {
      setMessage('Narration saved');
      invalidate();
    },
    onError: (err) => setMessage((err as Error).message),
  });

  const synthesizeTts = useMutation({
    mutationFn: (locale: LocaleKey) =>
      apiFetch<SceneTtsResponse>(
        `/v1/scenes/${scene.publicId}/localizations/${locale}/tts`,
        { method: 'POST', body: JSON.stringify({}) },
      ),
    onSuccess: (result) => {
      const voiceNote =
        result.locale === 'vi' && result.korvaVoiceVi
          ? ` (giọng ${result.korvaVoiceVi})`
          : '';
      setMessage(`Narration audio generated${voiceNote}`);
      invalidate();
    },
    onError: (err) => setMessage((err as Error).message),
  });

  const deleteScene = useMutation({
    mutationFn: () =>
      apiFetch(`/v1/scenes/${scene.publicId}`, { method: 'DELETE' }),
    onSuccess: () => invalidate(),
    onError: (err) => setMessage((err as Error).message),
  });

  const handleSaveScene = () => {
    const duration = durationSec.trim() === '' ? undefined : Number(durationSec);
    saveScene.mutate({
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      characterAction: characterAction.trim() || undefined,
      animationPreset: animationPreset.trim() || undefined,
      cameraPreset: cameraPreset.trim() || undefined,
      durationSec: Number.isFinite(duration) ? duration : undefined,
    });
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/60">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <CardTitle className="text-base font-medium">
          Scene #{scene.sortOrder + 1}
        </CardTitle>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={deleteScene.isPending}
          onClick={() => {
            if (window.confirm('Delete this scene?')) {
              deleteScene.mutate();
            }
          }}
        >
          Delete
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={`title-${scene.publicId}`}>Title</Label>
          <Input
            id={`title-${scene.publicId}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-zinc-700 bg-zinc-950"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={`desc-${scene.publicId}`}>Description</Label>
          <Textarea
            id={`desc-${scene.publicId}`}
            value={description}
            rows={3}
            onChange={(e) => setDescription(e.target.value)}
            className="border-zinc-700 bg-zinc-950"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`action-${scene.publicId}`}>Character action</Label>
          <Textarea
            id={`action-${scene.publicId}`}
            value={characterAction}
            rows={2}
            onChange={(e) => setCharacterAction(e.target.value)}
            className="border-zinc-700 bg-zinc-950"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`dur-${scene.publicId}`}>Duration (sec)</Label>
          <Input
            id={`dur-${scene.publicId}`}
            type="number"
            min={0}
            step={0.5}
            value={durationSec}
            onChange={(e) => setDurationSec(e.target.value)}
            className="border-zinc-700 bg-zinc-950"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`anim-${scene.publicId}`}>Animation preset</Label>
          <Input
            id={`anim-${scene.publicId}`}
            value={animationPreset}
            onChange={(e) => setAnimationPreset(e.target.value)}
            className="border-zinc-700 bg-zinc-950"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`cam-${scene.publicId}`}>Camera preset</Label>
          <Input
            id={`cam-${scene.publicId}`}
            value={cameraPreset}
            onChange={(e) => setCameraPreset(e.target.value)}
            className="border-zinc-700 bg-zinc-950"
          />
        </div>
        {(['vi', 'en'] as const).map((locale) => {
          const loc = scene.localizations.find((l) => l.locale === locale);
          const audioSrc =
            loc?.audioUrl != null
              ? apiAssetUrlVersioned(loc.audioUrl, loc.audioGeneratedAt)
              : null;
          return (
            <div key={locale} className="space-y-2">
              <Label htmlFor={`${locale}-${scene.publicId}`}>
                Narration ({locale.toUpperCase()})
              </Label>
              {locale === 'vi' && korvaVoiceVi ? (
                <p className="text-xs text-zinc-600">
                  Giọng Korva từ{' '}
                  <Link href="/settings/tts" className="text-zinc-400 underline hover:text-zinc-200">
                    Settings → TTS
                  </Link>
                  : <code className="text-zinc-500">{korvaVoiceVi}</code>
                </p>
              ) : null}
              <Textarea
                id={`${locale}-${scene.publicId}`}
                value={narration[locale]}
                rows={3}
                onChange={(e) => setNarration((prev) => ({ ...prev, [locale]: e.target.value }))}
                className="border-zinc-700 bg-zinc-950"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={saveLocale.isPending}
                  onClick={() => saveLocale.mutate({ locale, text: narration[locale] })}
                >
                  Save {locale.toUpperCase()}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-zinc-700"
                  disabled={
                    synthesizeTts.isPending ||
                    narration[locale].trim() === ''
                  }
                  onClick={() => synthesizeTts.mutate(locale)}
                >
                  {synthesizeTts.isPending ? 'TTS…' : `Generate TTS (${locale})`}
                </Button>
              </div>
              {audioSrc ? (
                <audio
                  key={`${loc?.audioGeneratedAt ?? 'none'}-${korvaVoiceVi ?? ''}`}
                  controls
                  className="w-full max-w-md"
                  src={audioSrc}
                >
                  <track kind="captions" />
                </audio>
              ) : null}
              {loc?.audioGeneratedAt ? (
                <p className="text-xs text-zinc-600">
                  Audio: {new Date(loc.audioGeneratedAt).toLocaleString()}
                </p>
              ) : null}
            </div>
          );
        })}
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-4">
        {message ? <span className="text-xs text-zinc-500">{message}</span> : <span />}
        <Button
          type="button"
          onClick={handleSaveScene}
          disabled={saveScene.isPending}
          className="bg-red-600 hover:bg-red-500"
        >
          Save scene
        </Button>
      </CardFooter>
    </Card>
  );
}