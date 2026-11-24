import { Body, Controller, Param, Post } from '@nestjs/common';
import {
  aiGenerateOptionsSchema,
  type AiGenerateOptions,
  projectPublicParamsSchema,
} from '@ai-video-studio/validation';

import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

import { ProjectAiService } from './project-ai.service';

@Controller('v1/projects')
export class ProjectAiController {
  constructor(private readonly ai: ProjectAiService) {}

  @Post(':publicId/ai/script')
  generateScript(
    @Param(new ZodValidationPipe(projectPublicParamsSchema))
    params: { publicId: string },
    @Body(new ZodValidationPipe(aiGenerateOptionsSchema.optional()))
    body?: AiGenerateOptions,
  ) {
    return this.ai.generateScript(params.publicId, body);
  }

  @Post(':publicId/ai/storyboard')
  generateStoryboard(
    @Param(new ZodValidationPipe(projectPublicParamsSchema))
    params: { publicId: string },
    @Body(new ZodValidationPipe(aiGenerateOptionsSchema.optional()))
    body?: AiGenerateOptions,
  ) {
    return this.ai.generateStoryboard(params.publicId, body);
  }
}
