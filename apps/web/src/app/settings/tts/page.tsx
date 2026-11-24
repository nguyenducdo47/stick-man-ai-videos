'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { StudioShell } from '@/components/studio-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiFetch, apiFetchBlob } from '@/lib/api';
import {
  DEFAULT_TTS_PREVIEW_VI_TEXT,
  type TtsPreferencesResponse,
  type TtsStatusResponse,
  type UpdateTtsPreferencesInput,
} from '@ai-video-studio/validation';

export default function TtsSettingsPage() {
  const queryClient = useQueryClient();
  const [selectedVoice, setSelectedVoice] = useState('');
  const [previewText, setPreviewText] = useState(DEFAULT_TTS_PREVIEW_VI_TEXT);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const statusQuery = useQuery({
    queryKey: ['tts-status'],
    queryFn: () => apiFetch<TtsStatusResponse>('/v1/tts/status'),
    refetchInterval: 30_000,
  });

  const prefsQuery = useQuery({
    queryKey: ['tts-preferences'],
    queryFn: () => apiFetch<TtsPreferencesResponse>('/v1/tts/preferences'),
  });

  const voices =
    prefsQuery.data?.korvaVoices ??
    statusQuery.data?.korvaVoices ??
    [];

  const activeVoice =
    prefsQuery.data?.korvaVoiceVi ?? statusQuery.data?.korvaVoiceVi ?? '';

  useEffect(() => {
    if (activeVoice) {
      setSelectedVoice(activeVoice);
    }
  }, [activeVoice]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const previewVoice = useMutation({
    mutationFn: async () => {
      const text = previewText.trim() || DEFAULT_TTS_PREVIEW_VI_TEXT;
      return apiFetchBlob('/v1/tts/preview', {
        method: 'POST',
        body: JSON.stringify({
          korvaVoiceVi: selectedVoice,
          text,
        }),
      });
    },
    onSuccess: (blob) => {
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      setSaveMessage(null);
    },
    onError: (err) => setSaveMessage((err as Error).message),
  });

  const savePrefs = useMutation({
    mutationFn: (body: UpdateTtsPreferencesInput) =>
      apiFetch<TtsPreferencesResponse>('/v1/tts/preferences', {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      setSaveMessage('Đã lưu giọng VI — bấm Generate TTS (vi) lại để nghe.');
      void queryClient.invalidateQueries({ queryKey: ['tts-status'] });
      void queryClient.invalidateQueries({ queryKey: ['tts-preferences'] });
      void queryClient.invalidateQueries({ queryKey: ['scenes'] });
    },
    onError: (err) => setSaveMessage((err as Error).message),
  });

  const data = statusQuery.data;

  return (
    <StudioShell
      title="Local TTS"
      subtitle="KorvaTTS narration — chọn giọng tiếng Việt trên web"
    >
      {statusQuery.isError ? (
        <p className="text-sm text-red-400">{(statusQuery.error as Error).message}</p>
      ) : null}

      <Card className="border-zinc-800 bg-zinc-900/40">
        <CardHeader>
          <CardTitle className="text-base">TTS service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-zinc-300">
          {statusQuery.isLoading ? <p className="text-zinc-500">Checking…</p> : null}
          {data ? (
            <>
              <p>
                URL: <code className="text-zinc-400">{data.serviceUrl}</code>
              </p>
              <p>
                Reachable:{' '}
                <span className={data.reachable ? 'text-emerald-400' : 'text-red-400'}>
                  {data.reachable ? 'yes' : 'no'}
                </span>
              </p>
              {data.engine ? (
                <p>
                  Engine: <code className="text-zinc-400">{data.engine}</code>
                  {data.engine === 'korva' ? (
                    <span className="text-emerald-400"> (KorvaTTS)</span>
                  ) : null}
                </p>
              ) : null}
              {data.detail ? <p className="text-zinc-500">{data.detail}</p> : null}
              {data.error ? <p className="text-amber-400">{data.error}</p> : null}
              {typeof data.vietnameseVoiceAvailable === 'boolean' ? (
                <p>
                  Giọng tiếng Việt:{' '}
                  <span
                    className={
                      data.vietnameseVoiceAvailable ? 'text-emerald-400' : 'text-amber-400'
                    }
                  >
                    {data.vietnameseVoiceAvailable ? 'sẵn sàng' : 'chưa có — xem docs/TTS_VIETNAMESE.md'}
                  </span>
                </p>
              ) : null}
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card className="mt-6 border-zinc-800 bg-zinc-900/40">
        <CardHeader>
          <CardTitle className="text-base">Giọng Korva (tiếng Việt)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {voices.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Không lấy được danh sách giọng — kiểm tra service TTS (port 5001) đang chạy.
            </p>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="korva-voice">Giọng đang dùng cho Generate TTS (vi)</Label>
              <select
                id="korva-voice"
                value={selectedVoice}
                disabled={savePrefs.isPending}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full max-w-md rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
              >
                {voices.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              <p className="text-xs text-zinc-600">
                Lưu vào{' '}
                <code className="text-zinc-500">data/studio/tts-preferences.v1.json</code> — không
                cần sửa .env hay restart uvicorn.
              </p>
              <div className="space-y-2 pt-2">
                <Label htmlFor="preview-text">Câu nghe thử</Label>
                <Textarea
                  id="preview-text"
                  value={previewText}
                  rows={2}
                  disabled={previewVoice.isPending}
                  onChange={(e) => setPreviewText(e.target.value)}
                  className="max-w-md border-zinc-700 bg-zinc-950"
                />
              </div>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-zinc-700"
              disabled={!selectedVoice || previewVoice.isPending || !data?.reachable}
              onClick={() => previewVoice.mutate()}
            >
              {previewVoice.isPending ? 'Đang tạo audio…' : 'Nghe thử'}
            </Button>
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-500"
              disabled={
                !selectedVoice || savePrefs.isPending || selectedVoice === activeVoice
              }
              onClick={() => savePrefs.mutate({ korvaVoiceVi: selectedVoice })}
            >
              {savePrefs.isPending ? 'Đang lưu…' : 'Lưu giọng'}
            </Button>
            {activeVoice ? (
              <span className="text-xs text-zinc-500">
                Đang chọn: <code className="text-zinc-400">{activeVoice}</code>
              </span>
            ) : null}
          </div>
          {previewUrl ? (
            <audio
              key={previewUrl}
              controls
              autoPlay
              className="w-full max-w-md"
              src={previewUrl}
            >
              <track kind="captions" />
            </audio>
          ) : null}
          {saveMessage ? <p className="text-xs text-zinc-500">{saveMessage}</p> : null}
        </CardContent>
      </Card>

      <p className="mt-6 text-xs text-zinc-600">
        Sau khi đổi giọng, vào project và bấm lại{' '}
        <strong className="font-medium text-zinc-500">Generate TTS (vi)</strong>.
      </p>
    </StudioShell>
  );
}