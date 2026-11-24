import { Module } from '@nestjs/common';

import { PreviewModule } from '../preview/preview.module';
import { ProjectsModule } from '../projects/projects.module';

import { ProjectRenderController } from './project-render.controller';
import { ProjectRenderService } from './project-render.service';

@Module({
  imports: [ProjectsModule, PreviewModule],
  controllers: [ProjectRenderController],
  providers: [ProjectRenderService],
})
export class RenderModule {}