import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { buildSceneGraph, buildSceneGraphV2 } from '@ai-video-studio/animation-engine';
import {
  sceneGraphResponseSchema,
  sceneGraphV2ResponseSchema,
  type SceneGraphResponse,
  type SceneGraphV2Response,
} from '@ai-video-studio/validation';
import {
  projectDataDir,
  projectSceneGraphFile,
  projectSceneGraphV2File,
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
        config: s.config,
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

  async compileV2(
    projectPublicId: string,
    persist = false,
  ): Promise<SceneGraphV2Response> {
    const project = await this.projects.getOwnedProject(projectPublicId);
    const scenes = await this.prisma.client.scene.findMany({
      where: { projectId: project.id },
      orderBy: { sortOrder: 'asc' },
    });

    const sourceScenes = scenes.map((s) => ({
      publicId: s.publicId,
      sortOrder: s.sortOrder,
      title: s.title,
      description: s.description,
      characterAction: s.characterAction,
      animationPreset: s.animationPreset,
      cameraPreset: s.cameraPreset,
      durationSec: s.durationSec,
      config: s.config,
    }));

    const graph = buildSceneGraphV2({
      projectPublicId,
      visualStyle: project.visualStyle,
      scenes: sourceScenes,
    });

    const v1 = buildSceneGraph({
      projectPublicId,
      visualStyle: project.visualStyle,
      scenes: sourceScenes,
    });

    const root = resolve(this.storageRoot());
    let savedPath: string | null = null;
    let v1SavedPath: string | null = null;
    if (persist) {
      const dir = projectDataDir(root, projectPublicId);
      const fileV2 = projectSceneGraphV2File(root, projectPublicId);
      const fileV1 = projectSceneGraphFile(root, projectPublicId);
      await mkdir(dir, { recursive: true });
      await writeFile(fileV2, `${JSON.stringify(graph, null, 2)}\n`, 'utf8');
      await writeFile(fileV1, `${JSON.stringify(v1, null, 2)}\n`, 'utf8');
      savedPath = relative(root, fileV2).replace(/\\/g, '/');
      v1SavedPath = relative(root, fileV1).replace(/\\/g, '/');
    } else {
      savedPath = await this.readExistingV2Path(root, projectPublicId);
      v1SavedPath = await this.readExistingSavedPath(root, projectPublicId);
    }

    return sceneGraphV2ResponseSchema.parse({
      projectPublicId,
      graph,
      savedPath,
      v1SavedPath,
    });
  }

  private async readExistingV2Path(
    storageRoot: string,
    projectPublicId: string,
  ): Promise<string | null> {
    const file = projectSceneGraphV2File(storageRoot, projectPublicId);
    try {
      await access(file);
      return relative(storageRoot, file).replace(/\\/g, '/');
    } catch {
      return null;
    }
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
