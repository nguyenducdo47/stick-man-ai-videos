import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { z } from 'zod';
import {
  type CreateSceneInput,
  createSceneSchema,
  type SceneLocalizationInput,
  projectPublicParamsSchema,
  sceneLocalizationSchema,
  sceneTimelinePatchSchema,
  type SceneTimelinePatch,
  type UpdateSceneInput,
  updateSceneSchema,
} from '@ai-video-studio/validation';
import { SUPPORTED_LOCALES } from '@ai-video-studio/shared';

import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

import { ScenesService } from './scenes.service';

const scenePublicParamsSchema = z.object({
  publicId: z.string().uuid(),
});

const localeParamsSchema = z.object({
  publicId: z.string().uuid(),
  locale: z.enum(SUPPORTED_LOCALES),
});

@Controller()
export class ScenesController {
  constructor(private readonly scenes: ScenesService) {}

  @Get('v1/projects/:publicId/scenes')
  list(
    @Param(new ZodValidationPipe(projectPublicParamsSchema))
    params: {
      publicId: string;
    },
  ) {
    return this.scenes.listForProject(params.publicId);
  }

  @Post('v1/projects/:publicId/scenes')
  create(
    @Param(new ZodValidationPipe(projectPublicParamsSchema))
    params: { publicId: string },
    @Body(new ZodValidationPipe(createSceneSchema)) body: CreateSceneInput,
  ) {
    return this.scenes.create(params.publicId, body);
  }

  @Delete('v1/scenes/:publicId')
  remove(
    @Param(new ZodValidationPipe(scenePublicParamsSchema))
    params: {
      publicId: string;
    },
  ) {
    return this.scenes.remove(params.publicId);
  }

  @Get('v1/scenes/:publicId/timeline')
  getTimeline(
    @Param(new ZodValidationPipe(scenePublicParamsSchema))
    params: { publicId: string },
  ) {
    return this.scenes.getTimeline(params.publicId);
  }

  @Patch('v1/scenes/:publicId/timeline')
  patchTimeline(
    @Param(new ZodValidationPipe(scenePublicParamsSchema))
    params: { publicId: string },
    @Body(new ZodValidationPipe(sceneTimelinePatchSchema))
    body: SceneTimelinePatch,
  ) {
    return this.scenes.patchTimeline(params.publicId, body);
  }

  @Patch('v1/scenes/:publicId')
  update(
    @Param(new ZodValidationPipe(scenePublicParamsSchema))
    params: { publicId: string },
    @Body(new ZodValidationPipe(updateSceneSchema)) body: UpdateSceneInput,
  ) {
    return this.scenes.update(params.publicId, body);
  }

  @Patch('v1/scenes/:publicId/localizations/:locale')
  updateLocalization(
    @Param(new ZodValidationPipe(localeParamsSchema))
    params: { publicId: string; locale: (typeof SUPPORTED_LOCALES)[number] },
    @Body(new ZodValidationPipe(sceneLocalizationSchema))
    body: SceneLocalizationInput,
  ) {
    return this.scenes.upsertLocalization(params.publicId, params.locale, body);
  }
}
