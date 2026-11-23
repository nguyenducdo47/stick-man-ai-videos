import { Module } from '@nestjs/common';

import { ScenesController } from '../scenes/scenes.controller';
import { ScenesService } from '../scenes/scenes.service';

import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  controllers: [ProjectsController, ScenesController],
  providers: [ProjectsService, ScenesService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
