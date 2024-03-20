import { Module } from '@nestjs/common';
import { DevicesTokensService } from './devices-tokens.service';
import { DevicesTokensController } from './devices-tokens.controller';
import { DeviceToken } from './entities/devices-token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([DeviceToken])],
  controllers: [DevicesTokensController],
  providers: [DevicesTokensService],
})
export class DevicesTokensModule {}
