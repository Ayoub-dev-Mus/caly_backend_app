import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { Store } from './entities/store.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { StoreType } from './entities/storeType';

@Module({
  imports: [TypeOrmModule.forFeature([Store, StoreType]), HttpModule],
  controllers: [StoresController],
  providers: [StoresService],
})
export class StoresModule { }
