import {
  Controller,
  Get,
  Head,
  HttpCode,
  NotFoundException,
  Param,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  environmentGlbFile,
  resolveDataRoot,
  stickmanHeroGlbFile,
} from '@ai-video-studio/storage';
import {
  environmentIdSchema,
  type EnvironmentId,
} from '@ai-video-studio/validation';
import { access } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import type { Response } from 'express';

import { AssetsStatusService } from './assets-status.service';

@Controller()
export class AssetsController {
  constructor(
    private readonly config: ConfigService,
    private readonly status: AssetsStatusService,
  ) {}

  private storageRoot(): string {
    const configured = this.config.get<string>('STORAGE_ROOT') ?? './data';
    return resolveDataRoot(process.cwd(), configured);
  }

  @Get('v1/assets/status')
  getAssetStatus() {
    return this.status.getStatus();
  }

  @Head('v1/assets/stickman-hero.glb')
  @HttpCode(200)
  async headStickmanHero(@Res() res: Response) {
    const ok = await this.status.headHeroAvailable();
    if (!ok) {
      res.status(404).end();
      return;
    }
    res.status(200).end();
  }

  @Head('v1/assets/environments/:fileName')
  @HttpCode(200)
  async headEnvironmentGlb(
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ) {
    const base = fileName.replace(/\.glb$/i, '');
    const parsed = environmentIdSchema.safeParse(base);
    if (!parsed.success || parsed.data === 'studio_grid') {
      res.status(404).end();
      return;
    }
    const ok = await this.status.headEnvironmentAvailable(parsed.data);
    res.status(ok ? 200 : 404).end();
  }

  @Get('v1/assets/stickman-hero.glb')
  async stickmanHero(@Res() res: Response) {
    const file = stickmanHeroGlbFile(this.storageRoot());
    try {
      await access(file);
    } catch {
      throw new NotFoundException(
        'Hero GLB not installed. See data/assets/characters/README.md',
      );
    }
    res.setHeader('Content-Type', 'model/gltf-binary');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    createReadStream(file).pipe(res);
  }

  @Get('v1/assets/environments/:fileName')
  async environmentGlb(
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ) {
    const base = fileName.replace(/\.glb$/i, '');
    const parsed = environmentIdSchema.safeParse(base);
    if (!parsed.success) {
      throw new NotFoundException(
        `Unknown environment "${base}". See data/assets/environments/README.md`,
      );
    }
    const environmentId = parsed.data as EnvironmentId;
    if (environmentId === 'studio_grid') {
      throw new NotFoundException('studio_grid uses built-in grid; no GLB.');
    }
    const file = environmentGlbFile(this.storageRoot(), environmentId);
    try {
      await access(file);
    } catch {
      throw new NotFoundException(
        `Environment GLB missing for "${environmentId}". Run scripts/install-cc0-glb-assets.mjs or copy to data/assets/environments/`,
      );
    }
    res.setHeader('Content-Type', 'model/gltf-binary');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    createReadStream(file).pipe(res);
  }
}