import { Module } from '@nestjs/common';
import { AiDirector } from '@ai-video-studio/ai-engine';

import { ProjectsModule } from '../projects/projects.module';

import { OllamaFactory } from './ollama.factory';
import { ProjectAiController } from './project-ai.controller';
import { ProjectAiService } from './project-ai.service';

@Module({
  imports: [ProjectsModule],
  controllers: [ProjectAiController],
  providers: [
    OllamaFactory,
    {
      provide: AiDirector,
      useFactory: (factory: OllamaFactory) => new AiDirector(factory.create()),
      inject: [OllamaFactory],
    },
    ProjectAiService,
  ],
  exports: [OllamaFactory],
})
export class AiModule {}
