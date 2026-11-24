import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { buildSceneGraph } from '@ai-video-studio/animation-engine';
import {
  sceneGraphResponseSchema,
  type SceneGraphResponse,
} from '@ai-video-studio/validation';
import {
  projectDataDir,
  projectSceneGraphFile,
  resolveDataRoot,
} from '@ai-video-studio/storage';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

import { ProjectsService } from '../projects/projects.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SceneGraphService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
    private readonly config: ConfigService,
  ) {}

  private storageRoot(): string {
    const configured = this.config.get<string>('STORAGE_ROOT') ?? './data';
    return resolveDataRoot(process.cwd(), configured);
  }

  async compile(
    projectPublicId: string,
    persist = false,
  ): Promise<SceneGraphResponse> {
    const project = await this.projects.getOwnedProject(projectPublicId);
    const scenes = await this.prisma.client.scene.findMany({
      where: { projectId: project.id },
      orderBy: { sortOrder: 'asc' },
    });

    const graph = buildSceneGraph({
      projectPublicId,
      visualStyle: project.visualStyle,
      scenes: scenes.map((s) => ({
        publicId: s.publicId,
        sortOrder: s.sortOrder,
        title: s.title,
        description: s.description,
        characterAction: s.characterAction,
        animationPreset: s.animationPreset,
        cameraPreset: s.cameraPreset,
        durationSec: s.durationSec,
      })),
    });

    const root = resolve(this.storageRoot());
    let savedPath: string | null = null;
    if (persist) {
      const dir = projectDataDir(root, projectPublicId);
      const file = projectSceneGraphFile(root, projectPublicId);
      await mkdir(dir, { recursive: true });
      await writeFile(file, `${JSON.stringify(graph, null, 2)}\n`, 'utf8');
      savedPath = relative(root, file).replace(/\\/g, '/');
    } else {
      savedPath = await this.readExistingSavedPath(root, projectPublicId);
    }

    const body = {
      projectPublicId,
      graph,
      savedPath,
    };
    return sceneGraphResponseSchema.parse(body);
  }

  private async readExistingSavedPath(
    storageRoot: string,
    projectPublicId: string,
  ): Promise<string | null> {
    const file = projectSceneGraphFile(storageRoot, projectPublicId);
    try {
      await access(file);
      return relative(storageRoot, file).replace(/\\/g, '/');
    } catch {
      return null;
    }
  }
}
