import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { StoresService } from './stores.service';

import { UpdateStoreDto } from './dto/update-store.dto';
import { Store } from './entities/store.entity';
import { DeleteResult, UpdateResult } from 'typeorm';
import { ApiTags } from '@nestjs/swagger';
import CreateStoreDto from './dto/create-store.dto';
import { StoreType } from './entities/storeType';
import { CreateStoreTypeDto } from './dto/create-store-type.dto';

@ApiTags('Stores')
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) { }

  @Post()
  async create(@Body() createStoreDto: CreateStoreDto): Promise<Store> {
    return await this.storesService.create(createStoreDto);
  }

  @Get('types')
  async findAllStoreTypes(): Promise<StoreType[]> {
    return await this.storesService.findAllStoreTypes();
  }

  @Post('types')
  async createStoreType(@Body() storeType: CreateStoreTypeDto): Promise<StoreType> {
    return await this.storesService.createStoreType(storeType);
  }

  @Get('nearest')
  async findAllNearestStores(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('searchTerm') searchTerm: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ): Promise<{ stores: Store[], total: number }> {
    return await this.storesService.findAllNearestStores(latitude, longitude, searchTerm, page, pageSize);
  }


  @Get('/draw-road')
  async drawRoad(@Query('from') from: string, @Query('to') to: string): Promise<any> {
    return this.storesService.drawRoad(from, to);
  }


  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('searchTerm') searchTerm: string = ''
  ): Promise<{ stores: Store[], total: number }> {
    return await this.storesService.findAll(page, pageSize, searchTerm);
  }
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Store> {
    return await this.storesService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto): Promise<UpdateResult> {
    return await this.storesService.update(+id, updateStoreDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<DeleteResult> {
    return await this.storesService.remove(+id);
  }
}
