import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  type CreateProjectInput,
  createProjectSchema,
  projectPublicParamsSchema,
  type UpdateProjectInput,
  updateProjectSchema,
} from '@ai-video-studio/validation';

import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

import { ProjectsService } from './projects.service';

@Controller('v1/projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  list() {
    return this.projects.list();
  }

  @Get(':publicId')
  getOne(
    @Param(new ZodValidationPipe(projectPublicParamsSchema))
    params: {
      publicId: string;
    },
  ) {
    return this.projects.getByPublicId(params.publicId);
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createProjectSchema)) body: CreateProjectInput,
  ) {
    return this.projects.create(body);
  }

  @Patch(':publicId')
  update(
    @Param(new ZodValidationPipe(projectPublicParamsSchema))
    params: { publicId: string },
    @Body(new ZodValidationPipe(updateProjectSchema)) body: UpdateProjectInput,
  ) {
    return this.projects.update(params.publicId, body);
  }

  @Delete(':publicId')
  remove(
    @Param(new ZodValidationPipe(projectPublicParamsSchema))
    params: {
      publicId: string;
    },
  ) {
    return this.projects.remove(params.publicId);
  }
}
