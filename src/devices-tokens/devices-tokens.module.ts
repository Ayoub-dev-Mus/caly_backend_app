import { Module } from '@nestjs/common';
import { DevicesTokensService } from './devices-tokens.service';
import { DevicesTokensController } from './devices-tokens.controller';

@Module({
  controllers: [DevicesTokensController],
  providers: [DevicesTokensService],
})
export class DevicesTokensModule {}
