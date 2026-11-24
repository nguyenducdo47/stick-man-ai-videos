import { Module } from '@nestjs/common';

import { ProjectsModule } from '../projects/projects.module';
import { UsersModule } from '../users/users.module';

import { SceneTtsController } from './scene-tts.controller';
import { SceneTtsService } from './scene-tts.service';
import { TtsFactory } from './tts.factory';
import { TtsPreferencesStore } from './tts-preferences.store';

@Module({
  imports: [ProjectsModule, UsersModule],
  controllers: [SceneTtsController],
  providers: [SceneTtsService, TtsFactory, TtsPreferencesStore],
  exports: [SceneTtsService, TtsFactory],
})
export class TtsModule {}
