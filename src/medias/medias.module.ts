import { Module } from '@nestjs/common';
import { MediasService } from './medias.service';
import { MediasController } from './medias.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Icon } from './entities/icon';
import { Media } from './entities/media.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Media, Icon])],
  controllers: [MediasController],
  providers: [MediasService],
})
export class MediasModule { }
