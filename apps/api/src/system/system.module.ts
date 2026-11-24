import { Module } from '@nestjs/common';

import { AiModule } from '../ai/ai.module';

import { SystemController } from './system.controller';

@Module({
  imports: [AiModule],
  controllers: [SystemController],
})
export class SystemModule {}
