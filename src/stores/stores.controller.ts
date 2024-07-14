import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { StoresService } from './stores.service';
import { UpdateStoreDto } from './dto/update-store.dto';
import { Store } from './entities/store.entity';
import { DeleteResult, UpdateResult } from 'typeorm';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import CreateStoreDto from './dto/create-store.dto';
import { StoreType } from './entities/storeType';
import { CreateStoreTypeDto } from './dto/create-store-type.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { HasRoles } from 'src/common/role.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Role } from 'src/users/enums/role';

@ApiTags('Stores')
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) { }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.STORE_OWNER, Role.STORE_STAFF, Role.STAFF)
  @Post()
  async create(@Body() createStoreDto: CreateStoreDto): Promise<Store> {
    return await this.storesService.create(createStoreDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.STORE_OWNER, Role.STORE_STAFF, Role.STAFF)
  @Patch(':id/images')
  @UseInterceptors(FilesInterceptor('files'))
  async updateImages(@Param('id') id: number, @UploadedFiles() files: Multer.File[]) {
    return await this.storesService.updateStoreImages(id, files);
  }

  @Get('types')
  async findAllStoreTypes(): Promise<StoreType[]> {
    return await this.storesService.findAllStoreTypes();
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.STORE_OWNER, Role.STORE_STAFF, Role.STAFF)
  @Post('types')
  async createStoreType(
    @Body() storeType: CreateStoreTypeDto,
  ): Promise<StoreType> {
    return await this.storesService.createStoreType(storeType);
  }

  @Get('nearest')
  async findAllNearestStores(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('searchTerm') searchTerm: string,
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('storeType') storeType?: string,
  ): Promise<{ stores: Store[]; total: number }> {
    return await this.storesService.findAllNearestStoresCached(
      latitude,
      longitude,
      searchTerm,
      page,
      pageSize,
      storeType,
    );
  }

  @Get('/draw-road')
  async drawRoad(
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<any> {
    return this.storesService.drawRoad(from, to);
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('searchTerm') searchTerm: string = '',
  ): Promise<{ stores: Store[]; total: number }> {
    return await this.storesService.findAll(page, pageSize, searchTerm);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Store> {
    return await this.storesService.findOne(+id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.STORE_OWNER, Role.STORE_STAFF, Role.STAFF)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateStoreDto: UpdateStoreDto,
  ): Promise<UpdateResult> {
    return await this.storesService.update(+id, updateStoreDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.STORE_OWNER, Role.STORE_STAFF, Role.STAFF)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<DeleteResult> {
    return await this.storesService.remove(+id);
  }
}
