import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import type { RenderClip } from '@ai-video-studio/validation';

import { probeFfmpeg, remotionEntryPath } from './ffmpeg.js';

export const DEFAULT_RENDER_FPS = 30;
export const DEFAULT_RENDER_WIDTH = 1920;
export const DEFAULT_RENDER_HEIGHT = 1080;

export type RenderProjectVideoInput = {
  projectTitle: string;
  outputFilePath: string;
  scenes: RenderClip[];
  fps?: number;
  width?: number;
  height?: number;
  ffmpegPath?: string | null;
  bundleCacheDir?: string;
};

/** Bump when remotion composition changes — avoids stale webpack bundle. */
const REMOTION_BUNDLE_REVISION = 'stickman-3d-v1';

let serveUrlCache: string | null = null;
let bundlePromise: Promise<string> | null = null;
let bundleRevisionCached: string | null = null;

async function getServeUrl(bundleCacheDir: string): Promise<string> {
  if (
    serveUrlCache &&
    bundleRevisionCached === REMOTION_BUNDLE_REVISION
  ) {
    return serveUrlCache;
  }
  serveUrlCache = null;
  bundlePromise = null;
  if (!bundlePromise) {
    bundlePromise = (async () => {
      const entry = remotionEntryPath();
      const outDir = join(
        bundleCacheDir,
        'remotion-bundle',
        REMOTION_BUNDLE_REVISION,
      );
      await rm(outDir, { recursive: true, force: true });
      await mkdir(outDir, { recursive: true });
      const url = await bundle({
        entryPoint: entry,
        outDir,
        publicDir: null,
        webpackOverride: (config) => config,
      });
      serveUrlCache = url;
      bundleRevisionCached = REMOTION_BUNDLE_REVISION;
      return url;
    })();
  }
  return bundlePromise;
}

export async function renderProjectVideo(
  input: RenderProjectVideoInput,
): Promise<{ durationSec: number }> {
  if (input.scenes.length === 0) {
    throw new Error('No scenes to render');
  }

  const probe = await probeFfmpeg(input.ffmpegPath);
  if (!probe.available || !probe.path) {
    throw new Error(probe.error ?? 'FFmpeg is required for Remotion render');
  }

  process.env.REMOTION_FFMPEG_BINARY = probe.path;

  const fps = input.fps ?? DEFAULT_RENDER_FPS;
  const cacheDir =
    input.bundleCacheDir ?? join(dirname(input.outputFilePath), '.cache');

  const serveUrl = await getServeUrl(cacheDir);

  const inputProps = {
    projectTitle: input.projectTitle,
    fps,
    scenes: input.scenes.map((s) => ({
      scenePublicId: s.scenePublicId,
      sortOrder: s.sortOrder,
      title: s.title,
      durationSec: s.durationSec,
      audioSrc: s.audioSrc,
      animationPreset: s.animationPreset,
      cameraPreset: s.cameraPreset,
      characterColors: s.characterColors,
    })),
  };

  const composition = await selectComposition({
    serveUrl,
    id: 'ProjectVideo',
    inputProps,
  });

  await mkdir(dirname(input.outputFilePath), { recursive: true });

  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    outputLocation: input.outputFilePath,
    inputProps,
    imageFormat: 'jpeg',
    jpegQuality: 85,
    overwrite: true,
    chromiumOptions: {
      disableWebSecurity: true,
    },
    videoBitrate: '4M',
  });

  const totalDurationSec = input.scenes.reduce(
    (acc, s) => acc + s.durationSec,
    0,
  );

  return { durationSec: totalDurationSec };
}