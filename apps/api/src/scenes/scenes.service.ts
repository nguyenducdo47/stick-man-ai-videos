import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreateSceneInput,
  SceneLocalizationInput,
  UpdateSceneInput,
} from '@ai-video-studio/validation';
import { SUPPORTED_LOCALES } from '@ai-video-studio/shared';

import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { UsersService } from '../users/users.service';

import { toSceneResponse } from '../projects/projects.mapper';

@Injectable()
export class ScenesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
    private readonly users: UsersService,
  ) {}

  async listForProject(projectPublicId: string) {
    const projectId =
      await this.projects.findProjectIdByPublicId(projectPublicId);
    const scenes = await this.prisma.client.scene.findMany({
      where: { projectId },
      orderBy: { sortOrder: 'asc' },
      include: { localizations: true },
    });
    return { items: scenes.map(toSceneResponse) };
  }

  async create(projectPublicId: string, input: CreateSceneInput) {
    const projectId =
      await this.projects.findProjectIdByPublicId(projectPublicId);
    const project = await this.prisma.client.project.findUnique({
      where: { id: projectId },
      select: { languages: true },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const maxOrder = await this.prisma.client.scene.aggregate({
      where: { projectId },
      _max: { sortOrder: true },
    });
    const sortOrder =
      input.sortOrder ??
      (maxOrder._max.sortOrder !== null ? maxOrder._max.sortOrder + 1 : 0);

    const scene = await this.prisma.client.scene.create({
      data: {
        projectId,
        sortOrder,
        title: input.title,
        description: input.description,
        characterAction: input.characterAction,
        animationPreset: input.animationPreset,
        cameraPreset: input.cameraPreset,
        durationSec: input.durationSec,
        localizations: {
          create: project.languages.map((locale) => ({ locale })),
        },
      },
      include: { localizations: true },
    });
    return toSceneResponse(scene);
  }

  async update(scenePublicId: string, input: UpdateSceneInput) {
    await this.findSceneOrThrow(scenePublicId);
    const scene = await this.prisma.client.scene.update({
      where: { publicId: scenePublicId },
      data: {
        title: input.title,
        description: input.description,
        characterAction: input.characterAction,
        animationPreset: input.animationPreset,
        cameraPreset: input.cameraPreset,
        durationSec: input.durationSec,
        sortOrder: input.sortOrder,
      },
      include: { localizations: true },
    });
    return toSceneResponse(scene);
  }

  async remove(scenePublicId: string) {
    const scene = await this.findSceneOrThrow(scenePublicId);
    await this.prisma.client.scene.delete({ where: { id: scene.id } });
    return { deleted: true as const, publicId: scenePublicId };
  }

  async upsertLocalization(
    scenePublicId: string,
    locale: (typeof SUPPORTED_LOCALES)[number],
    input: SceneLocalizationInput,
  ) {
    const scene = await this.findSceneOrThrow(scenePublicId);
    if (!SUPPORTED_LOCALES.includes(locale)) {
      throw new NotFoundException(`Unsupported locale ${locale}`);
    }

    const localization = await this.prisma.client.sceneLocalization.upsert({
      where: {
        sceneId_locale: { sceneId: scene.id, locale },
      },
      create: {
        sceneId: scene.id,
        locale,
        narration: input.narration,
        subtitles: input.subtitles,
      },
      update: {
        narration: input.narration,
        subtitles: input.subtitles,
      },
    });

    return {
      locale: localization.locale as 'vi' | 'en',
      narration: localization.narration,
      subtitles: localization.subtitles,
    };
  }

  private async findSceneOrThrow(scenePublicId: string) {
    const userId = await this.users.getLocalUserId();
    const scene = await this.prisma.client.scene.findFirst({
      where: {
        publicId: scenePublicId,
        project: { userId },
      },
      include: { localizations: true },
    });
    if (!scene) {
      throw new NotFoundException(`Scene ${scenePublicId} not found`);
    }
    return scene;
  }
}
