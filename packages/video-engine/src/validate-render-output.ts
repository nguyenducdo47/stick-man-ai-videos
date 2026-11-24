import { execFile } from 'node:child_process';
import { stat } from 'node:fs/promises';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export type RenderValidationResult = {
  ok: boolean;
  fileBytes: number;
  durationSec: number | null;
  warnings: string[];
};

export async function validateRenderedMp4(
  filePath: string,
  ffmpegPath: string,
  expectedDurationSec: number,
): Promise<RenderValidationResult> {
  const warnings: string[] = [];
  const st = await stat(filePath);
  if (st.size < 8_192) {
    return {
      ok: false,
      fileBytes: st.size,
      durationSec: null,
      warnings: ['Output MP4 smaller than 8KB — likely black or empty.'],
    };
  }

  let durationSec: number | null = null;
  try {
    const { stderr } = await execFileAsync(
      ffmpegPath,
      ['-i', filePath, '-hide_banner'],
      { timeout: 15_000 },
    );
    const match = stderr.match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/);
    if (match) {
      durationSec =
        Number(match[1]) * 3600 +
        Number(match[2]) * 60 +
        Number(match[3]);
    }
  } catch (err) {
    const stderr = (err as { stderr?: string }).stderr ?? '';
    const match = stderr.match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/);
    if (match) {
      durationSec =
        Number(match[1]) * 3600 +
        Number(match[2]) * 60 +
        Number(match[3]);
    }
  }

  if (durationSec == null) {
    warnings.push('Could not read duration via ffprobe/ffmpeg.');
  } else {
    const delta = Math.abs(durationSec - expectedDurationSec);
    if (delta > expectedDurationSec * 0.15 + 1) {
      warnings.push(
        `Duration ${durationSec.toFixed(1)}s vs expected ${expectedDurationSec.toFixed(1)}s.`,
      );
    }
  }

  return {
    ok: warnings.length === 0,
    fileBytes: st.size,
    durationSec,
    warnings,
  };
}