import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { z } from 'zod';
import {
  projectPublicParamsSchema,
  ttsPreviewRequestSchema,
  updateTtsPreferencesSchema,
  type TtsPreviewRequest,
  type UpdateTtsPreferencesInput,
} from '@ai-video-studio/validation';
import { SUPPORTED_LOCALES } from '@ai-video-studio/shared';

import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

import { SceneTtsService } from './scene-tts.service';

const sceneLocaleParamsSchema = z.object({
  publicId: z.string().uuid(),
  locale: z.enum(SUPPORTED_LOCALES),
});

@Controller()
export class SceneTtsController {
  constructor(private readonly tts: SceneTtsService) {}

  @Get('v1/tts/status')
  getStatus() {
    return this.tts.getStatus();
  }

  @Get('v1/tts/preferences')
  getPreferences() {
    return this.tts.getPreferences();
  }

  @Patch('v1/tts/preferences')
  updatePreferences(
    @Body(new ZodValidationPipe(updateTtsPreferencesSchema))
    body: UpdateTtsPreferencesInput,
  ) {
    return this.tts.updatePreferences(body);
  }

  @Post('v1/tts/preview')
  @HttpCode(200)
  async preview(
    @Body(new ZodValidationPipe(ttsPreviewRequestSchema))
    body: TtsPreviewRequest,
    @Res() res: Response,
  ) {
    const wav = await this.tts.previewVi(body);
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Cache-Control', 'no-store');
    res.send(Buffer.from(wav));
  }

  @Post('v1/scenes/:publicId/localizations/:locale/tts')
  synthesizeLocale(
    @Param(new ZodValidationPipe(sceneLocaleParamsSchema))
    params: {
      publicId: string;
      locale: (typeof SUPPORTED_LOCALES)[number];
    },
  ) {
    return this.tts.synthesizeSceneLocale(params.publicId, params.locale);
  }

  @Post('v1/projects/:publicId/tts')
  synthesizeProject(
    @Param(new ZodValidationPipe(projectPublicParamsSchema))
    params: {
      publicId: string;
    },
  ) {
    return this.tts.synthesizeProject(params.publicId);
  }

  @Get('v1/scenes/:publicId/audio/:locale')
  streamAudio(
    @Param(new ZodValidationPipe(sceneLocaleParamsSchema))
    params: {
      publicId: string;
      locale: (typeof SUPPORTED_LOCALES)[number];
    },
    @Res() res: Response,
  ) {
    return this.tts.streamSceneAudio(params.publicId, params.locale, res);
  }
}
