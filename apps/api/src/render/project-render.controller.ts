import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  projectPublicParamsSchema,
  projectRenderRequestSchema,
  type ProjectRenderRequest,
} from '@ai-video-studio/validation';
import { SUPPORTED_LOCALES } from '@ai-video-studio/shared';
import { z } from 'zod';

import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

import { ProjectRenderService } from './project-render.service';

const projectLocaleParamsSchema = z.object({
  publicId: z.string().uuid(),
  locale: z.enum(SUPPORTED_LOCALES),
});

@Controller()
export class ProjectRenderController {
  constructor(private readonly render: ProjectRenderService) {}

  @Get('v1/render/status')
  getStatus() {
    return this.render.getStatus();
  }

  @Get('v1/projects/:publicId/renders')
  listRenders(
    @Param(new ZodValidationPipe(projectPublicParamsSchema))
    params: { publicId: string },
  ) {
    return this.render.listProjectRenders(params.publicId);
  }

  @Post('v1/projects/:publicId/render')
  @HttpCode(200)
  renderProject(
    @Param(new ZodValidationPipe(projectPublicParamsSchema))
    params: { publicId: string },
    @Body(new ZodValidationPipe(projectRenderRequestSchema))
    body: ProjectRenderRequest,
  ) {
    return this.render.renderProjectLocale(params.publicId, body);
  }

  @Get('v1/projects/:publicId/video/:locale')
  streamVideo(
    @Param(new ZodValidationPipe(projectLocaleParamsSchema))
    params: {
      publicId: string;
      locale: (typeof SUPPORTED_LOCALES)[number];
    },
    @Res() res: Response,
  ) {
    return this.render.streamProjectVideo(params.publicId, params.locale, res);
  }
}