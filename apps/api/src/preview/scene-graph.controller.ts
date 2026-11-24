import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  projectPublicParamsSchema,
  sceneGraphResponseSchema,
  sceneGraphV2ResponseSchema,
} from '@ai-video-studio/validation';
import { z } from 'zod';

import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

import { SceneGraphService } from './scene-graph.service';

const persistQuerySchema = z
  .object({
    save: z.enum(['true', 'false', '1', '0']).optional(),
  })
  .transform((q) => ({ save: q.save === 'true' || q.save === '1' }));

@Controller('v1/projects')
export class SceneGraphController {
  constructor(private readonly sceneGraph: SceneGraphService) {}

  @Get(':publicId/scene-graph')
  async getGraph(
    @Param(new ZodValidationPipe(projectPublicParamsSchema))
    params: { publicId: string },
    @Query(new ZodValidationPipe(persistQuerySchema)) query: { save?: boolean },
  ) {
    const result = await this.sceneGraph.compile(
      params.publicId,
      query.save ?? false,
    );
    return sceneGraphResponseSchema.parse(result);
  }

  @Get(':publicId/scene-graph-v2')
  async getGraphV2(
    @Param(new ZodValidationPipe(projectPublicParamsSchema))
    params: { publicId: string },
    @Query(new ZodValidationPipe(persistQuerySchema)) query: { save?: boolean },
  ) {
    const result = await this.sceneGraph.compileV2(
      params.publicId,
      query.save ?? false,
    );
    return sceneGraphV2ResponseSchema.parse(result);
  }

  @Post(':publicId/scene-graph-v2/compile')
  async compileAndSaveV2(
    @Param(new ZodValidationPipe(projectPublicParamsSchema))
    params: { publicId: string },
  ) {
    const result = await this.sceneGraph.compileV2(params.publicId, true);
    return sceneGraphV2ResponseSchema.parse(result);
  }

  @Post(':publicId/scene-graph/compile')
  async compileAndSave(
    @Param(new ZodValidationPipe(projectPublicParamsSchema))
    params: {
      publicId: string;
    },
  ) {
    const result = await this.sceneGraph.compile(params.publicId, true);
    return sceneGraphResponseSchema.parse(result);
  }
}
