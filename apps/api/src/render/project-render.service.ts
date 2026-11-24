import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  projectRenderListResponseSchema,
  projectRenderResponseSchema,
  renderStatusResponseSchema,
  type ProjectRenderListResponse,
  type ProjectRenderRequest,
  type ProjectRenderResponse,
  type RenderStatusResponse,
} from '@ai-video-studio/validation';
import {
  probeFfmpeg,
  readWavDurationSec,
  renderProjectVideo,
  remotionEntryPath,
} from '@ai-video-studio/video-engine';
import {
  projectRenderVideoFile,
  projectRenderVideoRelPath,
  sceneNarrationAudioFile,
  resolveDataRoot,
} from '@ai-video-studio/storage';
import { SUPPORTED_LOCALES } from '@ai-video-studio/shared';
import { access } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { join } from 'node:path';
import type { Response } from 'express';

import { SceneGraphService } from '../preview/scene-graph.service';
import { ProjectsService } from '../projects/projects.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectRenderService {
  private queue: Promise<unknown> = Promise.resolve();

  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
    private readonly sceneGraph: SceneGraphService,
    private readonly config: ConfigService,
  ) {}

  videoUrl(projectPublicId: string, locale: string, videoPath: string | null) {
    if (!videoPath) return null;
    return `/v1/projects/${projectPublicId}/video/${locale}`;
  }

  /** Base URL Remotion uses to fetch scene WAV (must be http/https, not file://). */
  private renderApiBase(): string {
    const configured = this.config.get<string>('API_PUBLIC_URL')?.trim();
    if (configured) {
      return configured.replace(/\/$/, '');
    }
    const host = this.config.get<string>('API_HOST') ?? '127.0.0.1';
    const port = this.config.get<string>('API_PORT') ?? '3001';
    return `http://${host}:${port}`;
  }

  private sceneAudioUrl(
    scenePublicId: string,
    locale: (typeof SUPPORTED_LOCALES)[number],
  ): string {
    return `${this.renderApiBase()}/v1/scenes/${scenePublicId}/audio/${locale}`;
  }

  async getStatus(): Promise<RenderStatusResponse> {
    const ffmpegPath = this.config.get<string>('FFMPEG_PATH') ?? null;
    const probe = await probeFfmpeg(ffmpegPath);
    const body = {
      ffmpegAvailable: probe.available,
      ffmpegPath: probe.path,
      remotionEntry: remotionEntryPath(),
      ...(probe.error ? { error: probe.error } : {}),
    };
    return renderStatusResponseSchema.parse(body);
  }

  async listProjectRenders(
    projectPublicId: string,
  ): Promise<ProjectRenderListResponse> {
    const project = await this.projects.getOwnedProject(projectPublicId);
    const rows = await this.prisma.client.projectRender.findMany({
      where: { projectId: project.id },
      orderBy: { locale: 'asc' },
    });

    const items = rows.map((row) => this.toRenderItem(projectPublicId, row));

    return projectRenderListResponseSchema.parse({
      projectPublicId,
      items,
    });
  }

  async renderProjectLocale(
    projectPublicId: string,
    body: ProjectRenderRequest,
  ): Promise<ProjectRenderResponse> {
    return this.runExclusive(() =>
      this.renderProjectLocaleInner(projectPublicId, body.locale),
    );
  }

  async streamProjectVideo(
    projectPublicId: string,
    locale: (typeof SUPPORTED_LOCALES)[number],
    res: Response,
  ) {
    const project = await this.projects.getOwnedProject(projectPublicId);
    const row = await this.prisma.client.projectRender.findUnique({
      where: {
        projectId_locale: { projectId: project.id, locale },
      },
    });
    if (!row?.videoPath || row.status !== 'SUCCESS') {
      throw new NotFoundException('No render for this project locale');
    }
    const abs = projectRenderVideoFile(
      this.storageRoot(),
      projectPublicId,
      locale,
    );
    try {
      await access(abs);
    } catch {
      throw new NotFoundException('Video file missing on disk');
    }
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Cache-Control', 'no-store');
    createReadStream(abs).pipe(res);
  }

  private async renderProjectLocaleInner(
    projectPublicId: string,
    locale: (typeof SUPPORTED_LOCALES)[number],
  ): Promise<ProjectRenderResponse> {
    const ffmpegPath = this.config.get<string>('FFMPEG_PATH') ?? null;
    const probe = await probeFfmpeg(ffmpegPath);
    if (!probe.available) {
      throw new ServiceUnavailableException(
        probe.error ?? 'FFmpeg not available for render',
      );
    }

    const project = await this.projects.getOwnedProject(projectPublicId);
    const scenes = await this.prisma.client.scene.findMany({
      where: { projectId: project.id },
      orderBy: { sortOrder: 'asc' },
      include: { localizations: true },
    });
    if (scenes.length === 0) {
      throw new BadRequestException('Project has no scenes to render');
    }

    const compiled = await this.sceneGraph.compile(projectPublicId, false);
    const graphById = new Map(
      compiled.graph.scenes.map((s) => [s.scenePublicId, s]),
    );

    const clips: Parameters<typeof renderProjectVideo>[0]['scenes'] = [];
    const missing: string[] = [];

    const root = this.storageRoot();
    for (const scene of scenes) {
      const gScene = graphById.get(scene.publicId);
      if (!gScene) {
        throw new BadRequestException(
          `Scene graph missing scene ${scene.publicId}`,
        );
      }
      const loc = scene.localizations.find((l) => l.locale === locale);
      if (!loc?.audioPath) {
        missing.push(scene.publicId);
        continue;
      }
      const wavPath = sceneNarrationAudioFile(
        root,
        projectPublicId,
        scene.publicId,
        locale,
      );
      try {
        await access(wavPath);
      } catch {
        missing.push(scene.publicId);
        continue;
      }
      const wavSec = readWavDurationSec(wavPath);
      const durationSec = Math.max(gScene.durationSec, wavSec, 0.5);
      clips.push({
        scenePublicId: scene.publicId,
        sortOrder: scene.sortOrder,
        title: scene.title,
        durationSec,
        audioSrc: this.sceneAudioUrl(scene.publicId, locale),
        animationPreset: gScene.animationPreset,
        cameraPreset: gScene.cameraPreset,
        characterColors: compiled.graph.character.colors,
      });
    }

    if (missing.length > 0) {
      throw new BadRequestException(
        `Missing narration audio for locale "${locale}" on ${missing.length} scene(s). Run TTS first.`,
      );
    }
    if (clips.length === 0) {
      throw new BadRequestException('No scenes with audio to render');
    }

    const rel = projectRenderVideoRelPath(projectPublicId, locale);
    const abs = projectRenderVideoFile(root, projectPublicId, locale);
    const bundleCacheDir = join(root, 'studio');

    let status: 'SUCCESS' | 'FAILED' = 'SUCCESS';
    let errorMessage: string | null = null;
    let durationSec: number | null = null;

    try {
      const result = await renderProjectVideo({
        projectTitle: project.title,
        outputFilePath: abs,
        scenes: clips,
        ffmpegPath: probe.path,
        bundleCacheDir,
      });
      durationSec = result.durationSec;
    } catch (err) {
      status = 'FAILED';
      errorMessage = err instanceof Error ? err.message : 'Render failed';
    }

    const now = new Date();
    const row = await this.prisma.client.projectRender.upsert({
      where: {
        projectId_locale: { projectId: project.id, locale },
      },
      create: {
        projectId: project.id,
        locale,
        status,
        videoPath: status === 'SUCCESS' ? rel : null,
        errorMessage,
        durationSec,
        sceneCount: clips.length,
      },
      update: {
        status,
        videoPath: status === 'SUCCESS' ? rel : null,
        errorMessage,
        durationSec,
        sceneCount: clips.length,
        updatedAt: now,
      },
    });

    if (status === 'FAILED') {
      throw new BadRequestException(errorMessage ?? 'Render failed');
    }

    return projectRenderResponseSchema.parse({
      ...this.toRenderItem(projectPublicId, row),
      projectPublicId,
      locale,
    });
  }

  private toRenderItem(
    projectPublicId: string,
    row: {
      status: 'SUCCESS' | 'FAILED';
      videoPath: string | null;
      durationSec: number | null;
      sceneCount: number | null;
      errorMessage: string | null;
      updatedAt: Date;
      locale: string;
    },
  ) {
    const success = row.status === 'SUCCESS';
    return {
      locale: row.locale as (typeof SUPPORTED_LOCALES)[number],
      status: row.status,
      videoPath: row.videoPath,
      videoUrl: success
        ? this.videoUrl(projectPublicId, row.locale, row.videoPath)
        : null,
      durationSec: row.durationSec,
      sceneCount: row.sceneCount,
      errorMessage: row.errorMessage,
      renderedAt: success ? row.updatedAt.toISOString() : null,
    };
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