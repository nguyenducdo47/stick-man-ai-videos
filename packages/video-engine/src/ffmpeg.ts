import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
import { access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const ffmpegNames = process.platform === 'win32' ? ['ffmpeg.exe', 'ffmpeg'] : ['ffmpeg'];

export type FfmpegProbe = {
  available: boolean;
  path: string | null;
  error?: string;
};

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/** FFmpeg shipped with @remotion/renderer (pnpm nest-safe resolution). */
function remotionBundledFfmpegCandidates(): string[] {
  const compositorByPlatform: Partial<Record<NodeJS.Platform, string>> = {
    win32: '@remotion/compositor-win32-x64-msvc',
    darwin: '@remotion/compositor-darwin-x64',
    linux: '@remotion/compositor-linux-x64-gnu',
  };
  const compositorPkg = compositorByPlatform[process.platform];
  if (!compositorPkg) {
    return [];
  }
  try {
    const requireVideoEngine = createRequire(join(__dirname, '..', 'package.json'));
    const rendererPkg = requireVideoEngine.resolve('@remotion/renderer/package.json');
    const requireRenderer = createRequire(rendererPkg);
    const compositorJson = requireRenderer.resolve(
      `${compositorPkg}/package.json`,
    );
    const bin =
      process.platform === 'win32'
        ? join(dirname(compositorJson), 'ffmpeg.exe')
        : join(dirname(compositorJson), 'ffmpeg');
    return [bin];
  } catch {
    return [];
  }
}

export async function probeFfmpeg(configuredPath?: string | null): Promise<FfmpegProbe> {
  const candidates: string[] = [];
  if (configuredPath?.trim()) {
    candidates.push(configuredPath.trim());
  }
  candidates.push(...ffmpegNames);
  candidates.push(...remotionBundledFfmpegCandidates());

  for (const candidate of candidates) {
    if (candidate.includes('/') || candidate.includes('\\')) {
      if (!(await pathExists(candidate))) {
        continue;
      }
    }
    try {
      const { stdout } = await execFileAsync(candidate, ['-version'], {
        timeout: 10_000,
      });
      if (stdout.includes('ffmpeg version')) {
        return { available: true, path: candidate };
      }
    } catch {
      continue;
    }
  }
  return {
    available: false,
    path: null,
    error:
      'FFmpeg not found. Set FFMPEG_PATH in .env, add ffmpeg to PATH, or reinstall deps (Remotion ships a binary). Laragon: Menu → Tools → Quick add → ffmpeg.',
  };
}

export function remotionEntryPath(): string {
  return join(__dirname, '..', 'remotion', 'index.ts');
}