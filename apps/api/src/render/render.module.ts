import { Module } from '@nestjs/common';

import { PreviewModule } from '../preview/preview.module';
import { ProjectsModule } from '../projects/projects.module';

import { ProjectRenderController } from './project-render.controller';
import { ProjectRenderService } from './project-render.service';
import { RenderQueueService } from './render-queue.service';

@Module({
  imports: [ProjectsModule, PreviewModule],
  controllers: [ProjectRenderController],
  providers: [ProjectRenderService, RenderQueueService],
  exports: [ProjectRenderService],
})
export class RenderModule {}