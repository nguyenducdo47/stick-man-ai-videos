import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { createRequire } from 'node:module';
import { mkdir, rm } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';

import type { RenderClip } from '@ai-video-studio/validation';

import { probeFfmpeg, remotionEntryPath } from './ffmpeg.js';
import {
  cleanupRemotionScratchFiles,
  commitRenderOutput,
  renderScratchOutputPath,
} from './finalize-render-output.js';

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
  assetsPublicDir?: string;
  quality?: 'preview' | 'standard' | 'high' | 'hq';
};

/** Bump when remotion composition changes — avoids stale webpack bundle. */
const REMOTION_BUNDLE_REVISION = 'stickman-6-v7';

const QUALITY_PRESETS = {
  preview: { width: 960, height: 540, jpegQuality: 55, videoBitrate: '1.5M' },
  standard: { width: 1920, height: 1080, jpegQuality: 85, videoBitrate: '4M' },
  high: { width: 1920, height: 1080, jpegQuality: 95, videoBitrate: '8M' },
  hq: { width: 1920, height: 1080, jpegQuality: 95, videoBitrate: '10M' },
} as const;

let serveUrlCache: string | null = null;
let bundlePromise: Promise<string> | null = null;
let bundleRevisionCached: string | null = null;

async function getServeUrl(
  bundleCacheDir: string,
  assetsPublicDir?: string,
): Promise<string> {
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
      const req = createRequire(join(__dirname, '..', 'package.json'));
      const url = await bundle({
        entryPoint: entry,
        outDir,
        publicDir: assetsPublicDir ?? null,
        webpackOverride: (config) => {
          config.resolve = config.resolve ?? {};
          config.resolve.alias = {
            ...(typeof config.resolve.alias === 'object' &&
            config.resolve.alias !== null
              ? config.resolve.alias
              : {}),
            react: req.resolve('react'),
            'react-dom': req.resolve('react-dom'),
            '@react-three/fiber': req.resolve('@react-three/fiber'),
          };
          return config;
        },
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
  const quality = input.quality ?? 'standard';
  const preset = QUALITY_PRESETS[quality];
  const cacheDir =
    input.bundleCacheDir ?? join(dirname(input.outputFilePath), '.cache');

  const serveUrl = await getServeUrl(cacheDir, input.assetsPublicDir);

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
      environmentId: s.environmentId,
      actionClips: s.actionClips,
      subtitleText: s.subtitleText ?? null,
      heroGlbSrc: s.heroGlbSrc ?? null,
      environmentGlbSrc: s.environmentGlbSrc ?? null,
      interactions: s.interactions ?? [],
      cameraKeyframes: s.cameraKeyframes,
    })),
  };

  const composition = await selectComposition({
    serveUrl,
    id: 'ProjectVideo',
    inputProps,
  });

  const finalOutput = input.outputFilePath;
  const outDir = dirname(finalOutput);
  await mkdir(outDir, { recursive: true });
  await cleanupRemotionScratchFiles(outDir, basename(finalOutput));

  const scratchOutput = renderScratchOutputPath(finalOutput);

  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    outputLocation: scratchOutput,
    inputProps,
    imageFormat: 'jpeg',
    jpegQuality: preset.jpegQuality,
    overwrite: true,
    chromiumOptions: {
      disableWebSecurity: true,
    },
    videoBitrate: preset.videoBitrate,
  });

  await commitRenderOutput(scratchOutput, finalOutput);

  const totalDurationSec = input.scenes.reduce(
    (acc, s) => acc + s.durationSec,
    0,
  );

  return { durationSec: totalDurationSec };
}