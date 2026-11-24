import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { resolveDataRoot } from '@ai-video-studio/storage';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export type TtsPreferencesFile = {
  korvaVoiceVi: string;
};

const REL_PATH = join('studio', 'tts-preferences.v1.json');
const DEFAULT_VI_VOICE = 'khanh_vy';

@Injectable()
export class TtsPreferencesStore {
  constructor(private readonly config: ConfigService) {}

  private storageRoot(): string {
    const configured = this.config.get<string>('STORAGE_ROOT') ?? './data';
    return resolveDataRoot(process.cwd(), configured);
  }

  private absPath(): string {
    return join(this.storageRoot(), REL_PATH);
  }

  async read(): Promise<TtsPreferencesFile> {
    const envDefault =
      this.config.get<string>('KORVATTS_VOICE_VI')?.trim() || DEFAULT_VI_VOICE;
    try {
      await access(this.absPath());
      const raw = await readFile(this.absPath(), 'utf8');
      const parsed = JSON.parse(raw) as Partial<TtsPreferencesFile>;
      const korvaVoiceVi =
        typeof parsed.korvaVoiceVi === 'string' && parsed.korvaVoiceVi.trim()
          ? parsed.korvaVoiceVi.trim()
          : envDefault;
      return { korvaVoiceVi };
    } catch {
      return { korvaVoiceVi: envDefault };
    }
  }

  async write(prefs: TtsPreferencesFile): Promise<TtsPreferencesFile> {
    const abs = this.absPath();
    await mkdir(dirname(abs), { recursive: true });
    await writeFile(abs, `${JSON.stringify(prefs, null, 2)}\n`, 'utf8');
    return prefs;
  }
}
