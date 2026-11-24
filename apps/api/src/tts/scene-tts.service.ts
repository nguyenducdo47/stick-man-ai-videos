import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  DEFAULT_TTS_PREVIEW_VI_TEXT,
  type TtsPreferencesResponse,
  type TtsPreviewRequest,
  type UpdateTtsPreferencesInput,
} from '@ai-video-studio/validation';
import { ConfigService } from '@nestjs/config';
import {
  sceneNarrationAudioFile,
  sceneNarrationAudioRelPath,
  resolveDataRoot,
} from '@ai-video-studio/storage';
import type {
  ProjectTtsBatchResponse,
  SceneTtsResponse,
} from '@ai-video-studio/validation';
import { SUPPORTED_LOCALES } from '@ai-video-studio/shared';
import { access } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { dirname } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import type { Response } from 'express';

import { ProjectsService } from '../projects/projects.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

import { TtsFactory } from './tts.factory';
import { TtsPreferencesStore } from './tts-preferences.store';

@Injectable()
export class SceneTtsService {
  private queue: Promise<unknown> = Promise.resolve();

  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
    private readonly users: UsersService,
    private readonly ttsFactory: TtsFactory,
    private readonly preferences: TtsPreferencesStore,
    private readonly config: ConfigService,
  ) {}

  audioUrl(scenePublicId: string, locale: string, audioPath: string | null) {
    if (!audioPath) return null;
    return `/v1/scenes/${scenePublicId}/audio/${locale}`;
  }

  async getStatus() {
    const serviceUrl =
      this.config.get<string>('TTS_SERVICE_URL') ?? 'http://127.0.0.1:5001';
    const health = await this.ttsFactory.create().checkHealth();
    const prefs = await this.preferences.read();
    return {
      reachable: health.reachable,
      engine: health.engine,
      detail: health.detail,
      vietnameseVoiceAvailable: health.vietnameseVoiceAvailable,
      korvaVoices: health.korvaVoices,
      korvaVoiceVi: prefs.korvaVoiceVi,
      korvaDefaultViVoice: health.korvaDefaultViVoice,
      error: health.error,
      serviceUrl,
    };
  }

  async getPreferences(): Promise<TtsPreferencesResponse> {
    const prefs = await this.preferences.read();
    const health = await this.ttsFactory.create().checkHealth();
    return {
      korvaVoiceVi: prefs.korvaVoiceVi,
      korvaVoices: health.korvaVoices,
    };
  }

  async previewVi(input: TtsPreviewRequest): Promise<Uint8Array> {
    await this.ensureTtsReady();
    const voice =
      input.korvaVoiceVi?.trim() ||
      (await this.preferences.read()).korvaVoiceVi;
    const text = (input.text?.trim() || DEFAULT_TTS_PREVIEW_VI_TEXT).slice(
      0,
      500,
    );
    if (!voice) {
      throw new BadRequestException('No Korva voice selected');
    }
    return this.ttsFactory.create().synthesizeWav(text, 'vi', { voice });
  }

  async updatePreferences(
    input: UpdateTtsPreferencesInput,
  ): Promise<TtsPreferencesResponse> {
    const health = await this.ttsFactory.create().checkHealth();
    if (
      health.korvaVoices?.length &&
      !health.korvaVoices.includes(input.korvaVoiceVi)
    ) {
      throw new BadRequestException(
        `Unknown Korva voice "${input.korvaVoiceVi}". Available: ${health.korvaVoices.join(', ')}`,
      );
    }
    await this.preferences.write({ korvaVoiceVi: input.korvaVoiceVi });
    return {
      korvaVoiceVi: input.korvaVoiceVi,
      korvaVoices: health.korvaVoices,
    };
  }

  private async korvaVoiceForLocale(
    locale: (typeof SUPPORTED_LOCALES)[number],
  ): Promise<string | undefined> {
    if (locale !== 'vi') return undefined;
    const prefs = await this.preferences.read();
    return prefs.korvaVoiceVi;
  }

  async synthesizeSceneLocale(
    scenePublicId: string,
    locale: (typeof SUPPORTED_LOCALES)[number],
  ): Promise<SceneTtsResponse> {
    return this.runExclusive(() =>
      this.synthesizeSceneLocaleInner(scenePublicId, locale),
    );
  }

  async synthesizeProject(
    projectPublicId: string,
  ): Promise<ProjectTtsBatchResponse> {
    return this.runExclusive(() =>
      this.synthesizeProjectInner(projectPublicId),
    );
  }

  async streamSceneAudio(
    scenePublicId: string,
    locale: (typeof SUPPORTED_LOCALES)[number],
    res: Response,
  ) {
    const scene = await this.findOwnedScene(scenePublicId);
    const localization = scene.localizations.find((l) => l.locale === locale);
    if (!localization?.audioPath) {
      throw new NotFoundException('No audio for this scene locale');
    }
    const root = this.storageRoot();
    const abs = sceneNarrationAudioFile(
      root,
      scene.project.publicId,
      scenePublicId,
      locale,
    );
    try {
      await access(abs);
    } catch {
      throw new NotFoundException('Audio file missing on disk');
    }
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Cache-Control', 'no-store');
    createReadStream(abs).pipe(res);
  }

  private async synthesizeProjectInner(
    projectPublicId: string,
  ): Promise<ProjectTtsBatchResponse> {
    const project = await this.projects.getOwnedProject(projectPublicId);
    const scenes = await this.prisma.client.scene.findMany({
      where: { projectId: project.id },
      orderBy: { sortOrder: 'asc' },
      include: { localizations: true, project: true },
    });

    const results: SceneTtsResponse[] = [];
    const failures: ProjectTtsBatchResponse['failures'] = [];
    let generated = 0;
    let skipped = 0;

    for (const scene of scenes) {
      for (const locale of SUPPORTED_LOCALES) {
        const loc = scene.localizations.find((l) => l.locale === locale);
        const text = loc?.narration?.trim();
        if (!text) {
          skipped += 1;
          continue;
        }
        try {
          const out = await this.synthesizeSceneLocaleInner(
            scene.publicId,
            locale,
          );
          results.push(out);
          generated += 1;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'TTS failed';
          failures.push({
            scenePublicId: scene.publicId,
            locale,
            error: message,
          });
        }
      }
    }

    return {
      projectPublicId,
      generated,
      skipped,
      results,
      failures,
    };
  }

  private async synthesizeSceneLocaleInner(
    scenePublicId: string,
    locale: (typeof SUPPORTED_LOCALES)[number],
  ): Promise<SceneTtsResponse> {
    const scene = await this.findOwnedScene(scenePublicId);
    const localization = scene.localizations.find((l) => l.locale === locale);
    const text = localization?.narration?.trim();
    if (!text) {
      throw new BadRequestException(
        `No narration text for locale "${locale}". Save narration first.`,
      );
    }
    await this.ensureTtsReady();

    const voice = await this.korvaVoiceForLocale(locale);
    const wav = await this.ttsFactory
      .create()
      .synthesizeWav(text, locale, voice ? { voice } : undefined);
    const rel = sceneNarrationAudioRelPath(
      scene.project.publicId,
      scenePublicId,
      locale,
    );
    const abs = sceneNarrationAudioFile(
      this.storageRoot(),
      scene.project.publicId,
      scenePublicId,
      locale,
    );
    await mkdir(dirname(abs), { recursive: true });
    await writeFile(abs, wav);

    const now = new Date();
    await this.prisma.client.sceneLocalization.upsert({
      where: {
        sceneId_locale: { sceneId: scene.id, locale },
      },
      create: {
        sceneId: scene.id,
        locale,
        narration: text,
        audioPath: rel,
        audioGeneratedAt: now,
      },
      update: {
        audioPath: rel,
        audioGeneratedAt: now,
      },
    });

    return {
      scenePublicId,
      locale,
      audioPath: rel,
      audioUrl: this.audioUrl(scenePublicId, locale, rel)!,
      skipped: false,
      ...(locale === 'vi' && voice ? { korvaVoiceVi: voice } : {}),
    };
  }

  private async ensureTtsReady() {
    const health = await this.ttsFactory.create().checkHealth();
    if (!health.reachable) {
      throw new ServiceUnavailableException(
        health.error ??
          'Local TTS is not reachable. Start services/local-tts (uvicorn on port 5001).',
      );
    }
  }

  private async findOwnedScene(scenePublicId: string) {
    const userId = await this.users.getLocalUserId();
    const scene = await this.prisma.client.scene.findFirst({
      where: {
        publicId: scenePublicId,
        project: { userId },
      },
      include: {
        localizations: true,
        project: true,
      },
    });
    if (!scene) {
      throw new NotFoundException(`Scene ${scenePublicId} not found`);
    }
    return scene;
  }

  private storageRoot(): string {
    const configured = this.config.get<string>('STORAGE_ROOT') ?? './data';
    return resolveDataRoot(process.cwd(), configured);
  }

  private async runExclusive<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.queue.then(fn, fn);
    this.queue = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }
}
