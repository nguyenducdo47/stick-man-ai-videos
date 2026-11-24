import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiDirector } from '@ai-video-studio/ai-engine';
import type { AiGenerateOptions } from '@ai-video-studio/validation';
import { ProjectStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import {
  toProjectResponse,
  toSceneResponse,
} from '../projects/projects.mapper';

import { OllamaFactory } from './ollama.factory';

@Injectable()
export class ProjectAiService {
  private queue: Promise<unknown> = Promise.resolve();

  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
    private readonly director: AiDirector,
    private readonly ollama: OllamaFactory,
    private readonly config: ConfigService,
  ) {}

  async generateScript(projectPublicId: string, options?: AiGenerateOptions) {
    return this.runExclusive(() =>
      this.generateScriptInner(projectPublicId, options),
    );
  }

  async generateStoryboard(
    projectPublicId: string,
    options?: AiGenerateOptions,
  ) {
    return this.runExclusive(() =>
      this.generateStoryboardInner(projectPublicId, options),
    );
  }

  private async runExclusive<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.queue.then(fn, fn);
    this.queue = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  private async ensureOllamaReady() {
    const provider = this.ollama.create();
    const health = await provider.checkHealth();
    if (!health.reachable) {
      throw new ServiceUnavailableException(
        health.error ?? 'Ollama is not reachable',
      );
    }
    const defaultModel =
      this.config.get<string>('OLLAMA_DEFAULT_MODEL') ?? 'qwen3:4b';
    const ok = await provider.verifyModel(defaultModel);
    if (!ok) {
      throw new ServiceUnavailableException(
        `Model "${defaultModel}" is not installed. Run: ollama pull ${defaultModel}`,
      );
    }
  }

  private async generateScriptInner(
    projectPublicId: string,
    options?: AiGenerateOptions,
  ) {
    await this.ensureOllamaReady();
    const projectRow = await this.projects.getOwnedProject(projectPublicId);
    const model =
      options?.model ??
      this.config.get<string>('OLLAMA_DEFAULT_MODEL') ??
      'qwen3:4b';

    try {
      const output = await this.director.generateScript(
        {
          title: projectRow.title,
          topic: projectRow.topic,
          targetDurationSec: projectRow.targetDurationSec,
          targetSceneCount: projectRow.targetSceneCount,
          visualStyle: projectRow.visualStyle,
          languages: projectRow.languages,
          creativeBrief: projectRow.scriptDraft,
        },
        options,
      );

      const updated = await this.prisma.client.project.update({
        where: { publicId: projectPublicId },
        data: {
          scriptDraft: output.script,
          status: ProjectStatus.SCRIPTING,
        },
        include: { _count: { select: { scenes: true } } },
      });

      await this.recordGeneration(projectRow.id, 'SCRIPT', model, true);

      return {
        project: toProjectResponse(updated),
        synopsis: output.synopsis ?? null,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      await this.recordGeneration(
        projectRow.id,
        'SCRIPT',
        model,
        false,
        message,
      );
      throw new ServiceUnavailableException(message);
    }
  }

  private async generateStoryboardInner(
    projectPublicId: string,
    options?: AiGenerateOptions,
  ) {
    await this.ensureOllamaReady();
    const projectRow = await this.projects.getOwnedProject(projectPublicId);
    if (!projectRow.scriptDraft?.trim()) {
      throw new BadRequestException(
        'Project has no script. Generate or paste a script first.',
      );
    }
    const model =
      options?.model ??
      this.config.get<string>('OLLAMA_DEFAULT_MODEL') ??
      'qwen3:4b';

    try {
      const output = await this.director.generateStoryboard(
        {
          title: projectRow.title,
          topic: projectRow.topic,
          targetDurationSec: projectRow.targetDurationSec,
          targetSceneCount: projectRow.targetSceneCount,
          visualStyle: projectRow.visualStyle,
          languages: projectRow.languages,
        },
        projectRow.scriptDraft,
        options,
      );

      const projectId = projectRow.id;
      const langs = projectRow.languages;

      await this.prisma.client.$transaction(async (tx) => {
        await tx.scene.deleteMany({ where: { projectId } });
        for (let i = 0; i < output.scenes.length; i++) {
          const s = output.scenes[i];
          await tx.scene.create({
            data: {
              projectId,
              sortOrder: i,
              title: s.title,
              description: s.description,
              characterAction: s.characterAction,
              animationPreset: s.animationPreset,
              cameraPreset: s.cameraPreset,
              durationSec: s.durationSec,
              localizations: {
                create: langs.map((locale) => ({
                  locale,
                  narration:
                    locale === 'vi'
                      ? s.narrationVi
                      : locale === 'en'
                        ? s.narrationEn
                        : undefined,
                  subtitles:
                    locale === 'vi'
                      ? s.narrationVi
                      : locale === 'en'
                        ? s.narrationEn
                        : undefined,
                })),
              },
            },
          });
        }
        await tx.project.update({
          where: { id: projectId },
          data: { status: ProjectStatus.STORYBOARD },
        });
      });

      const scenes = await this.prisma.client.scene.findMany({
        where: { projectId: projectRow.id },
        orderBy: { sortOrder: 'asc' },
        include: { localizations: true },
      });

      const project = await this.prisma.client.project.findUniqueOrThrow({
        where: { publicId: projectPublicId },
        include: { _count: { select: { scenes: true } } },
      });

      await this.recordGeneration(projectRow.id, 'STORYBOARD', model, true);

      return {
        project: toProjectResponse(project),
        scenes: scenes.map(toSceneResponse),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      await this.recordGeneration(
        projectRow.id,
        'STORYBOARD',
        model,
        false,
        message,
      );
      throw new ServiceUnavailableException(message);
    }
  }

  private async recordGeneration(
    projectId: bigint,
    kind: 'SCRIPT' | 'STORYBOARD',
    model: string,
    success: boolean,
    errorMessage?: string,
  ) {
    await this.prisma.client.aiGeneration.create({
      data: {
        projectId,
        kind,
        status: success ? 'SUCCESS' : 'FAILED',
        model,
        errorMessage,
      },
    });
  }
}
