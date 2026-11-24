import { Module } from '@nestjs/common';

import { AssetsController } from './assets.controller';
import { AssetsStatusService } from './assets-status.service';

@Module({
  controllers: [AssetsController],
  providers: [AssetsStatusService],
  exports: [AssetsStatusService],
})
export class AssetsModule {}