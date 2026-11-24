import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreateProjectInput,
  UpdateProjectInput,
} from '@ai-video-studio/validation';

import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

import { toProjectResponse } from './projects.mapper';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
  ) {}

  async list() {
    const userId = await this.users.getLocalUserId();
    const [items, total] = await Promise.all([
      this.prisma.client.project.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        include: { _count: { select: { scenes: true } } },
      }),
      this.prisma.client.project.count({ where: { userId } }),
    ]);
    return {
      items: items.map(toProjectResponse),
      total,
    };
  }

  async getByPublicId(publicId: string) {
    const project = await this.findProjectOrThrow(publicId);
    return toProjectResponse(project);
  }

  async create(input: CreateProjectInput) {
    const userId = await this.users.getLocalUserId();
    const project = await this.prisma.client.project.create({
      data: {
        userId,
        title: input.title,
        topic: input.topic,
        targetDurationSec: input.targetDurationSec,
        targetSceneCount: input.targetSceneCount,
        languages: input.languages,
        visualStyle: input.visualStyle,
      },
      include: { _count: { select: { scenes: true } } },
    });
    return toProjectResponse(project);
  }

  async update(publicId: string, input: UpdateProjectInput) {
    await this.findProjectOrThrow(publicId);
    const project = await this.prisma.client.project.update({
      where: { publicId },
      data: {
        title: input.title,
        topic: input.topic,
        targetDurationSec: input.targetDurationSec,
        targetSceneCount: input.targetSceneCount,
        languages: input.languages,
        visualStyle: input.visualStyle,
        scriptDraft: input.scriptDraft,
        status: input.status,
      },
      include: { _count: { select: { scenes: true } } },
    });
    return toProjectResponse(project);
  }

  async remove(publicId: string) {
    await this.findProjectOrThrow(publicId);
    await this.prisma.client.project.delete({ where: { publicId } });
    return { deleted: true as const, publicId };
  }

  /** Full Prisma row for owned project (includes internal id). */
  async getOwnedProject(publicId: string) {
    return this.findProjectOrThrow(publicId);
  }

  private async findProjectOrThrow(publicId: string) {
    const userId = await this.users.getLocalUserId();
    const project = await this.prisma.client.project.findFirst({
      where: { publicId, userId },
      include: { _count: { select: { scenes: true } } },
    });
    if (!project) {
      throw new NotFoundException(`Project ${publicId} not found`);
    }
    return project;
  }

  async findProjectIdByPublicId(publicId: string): Promise<bigint> {
    const project = await this.findProjectOrThrow(publicId);
    return project.id;
  }
}
