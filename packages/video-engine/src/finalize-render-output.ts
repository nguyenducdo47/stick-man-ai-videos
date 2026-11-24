import { randomUUID } from 'node:crypto';
import { copyFile, readdir, unlink } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Remotion scratch name next to the final .mp4 — clean leftovers from failed runs. */
export async function cleanupRemotionScratchFiles(dir: string, baseName: string) {
  try {
    const entries = await readdir(dir);
    const prefix = `${baseName}.`;
    for (const name of entries) {
      if (
        name.startsWith(prefix) &&
        (name.includes('.remotion-in-progress') || name.includes('.remotion-'))
      ) {
        try {
          await unlink(join(dir, name));
        } catch {
          // locked or racing — ignore
        }
      }
    }
  } catch {
    // directory missing
  }
}

export function renderScratchOutputPath(finalOutputPath: string): string {
  const dir = dirname(finalOutputPath);
  return join(dir, `.render-${randomUUID()}.mp4`);
}

/**
 * Move Remotion output into the stable project path (Windows-safe when vi.mp4 is locked in browser).
 */
export async function commitRenderOutput(
  scratchPath: string,
  finalOutputPath: string,
): Promise<void> {
  const attempts = 8;
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      try {
        await unlink(finalOutputPath);
      } catch (err) {
        const code = (err as NodeJS.ErrnoException).code;
        if (code !== 'ENOENT') {
          // overwrite via copy when delete is blocked (file open in preview)
        }
      }
      await copyFile(scratchPath, finalOutputPath);
      await unlink(scratchPath);
      return;
    } catch (err) {
      lastErr = err;
      await sleep(150 * (i + 1));
    }
  }
  const hint =
    'Close the video preview in the browser (or stop another render), then try again.';
  const message =
    lastErr instanceof Error ? `${lastErr.message}. ${hint}` : hint;
  throw new Error(message);
}