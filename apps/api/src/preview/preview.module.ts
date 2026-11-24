import { Module } from '@nestjs/common';

import { ProjectsModule } from '../projects/projects.module';

import { SceneGraphController } from './scene-graph.controller';
import { SceneGraphService } from './scene-graph.service';

@Module({
  imports: [ProjectsModule],
  controllers: [SceneGraphController],
  providers: [SceneGraphService],
  exports: [SceneGraphService],
})
export class PreviewModule {}
