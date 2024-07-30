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
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { StoresService } from './stores.service';
import { UpdateStoreDto } from './dto/update-store.dto';
import { Store } from './entities/store.entity';
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
  private readonly logger = new Logger(StoresController.name);

  constructor(private readonly storesService: StoresService) {}

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.STORE_OWNER, Role.STORE_STAFF, Role.STAFF)
  @Post()
  async create(@Body() createStoreDto: CreateStoreDto): Promise<any> {
    try {
      const store = await this.storesService.create(createStoreDto);
      return store; // Keep the same return format
    } catch (error) {
      this.logger.error('Failed to create store', error.stack);
      throw new HttpException({
        message: 'Failed to create store',
        error: error.message,
      }, HttpStatus.BAD_REQUEST);
    }
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.STORE_OWNER, Role.STORE_STAFF, Role.STAFF)
  @Patch(':id/images')
  @UseInterceptors(FilesInterceptor('files'))
  async updateImages(@Param('id') id: number, @UploadedFiles() files: Multer.File[]): Promise<any> {
    try {
      const result = await this.storesService.updateStoreImages(id, files);
      return result; // Keep the same return format
    } catch (error) {
      this.logger.error('Failed to update store images', error.stack);
      throw new HttpException({
        message: 'Failed to update store images',
        error: error.message,
      }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('types')
  async findAllStoreTypes(): Promise<any> {
    try {
      const storeTypes = await this.storesService.findAllStoreTypes();
      return storeTypes; // Keep the same return format
    } catch (error) {
      this.logger.error('Failed to retrieve store types', error.stack);
      throw new HttpException({
        message: 'Failed to retrieve store types',
        error: error.message,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.STORE_OWNER, Role.STORE_STAFF, Role.STAFF)
  @Post('types')
  async createStoreType(@Body() storeType: CreateStoreTypeDto): Promise<any> {
    try {
      const result = await this.storesService.createStoreType(storeType);
      return result; // Keep the same return format
    } catch (error) {
      this.logger.error('Failed to create store type', error.stack);
      throw new HttpException({
        message: 'Failed to create store type',
        error: error.message,
      }, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('nearest')
  async findAllNearestStores(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('searchTerm') searchTerm: string,
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('storeType') storeType?: string,
  ): Promise<any> {
    try {
      const result = await this.storesService.findAllNearestStoresCached(
        latitude,
        longitude,
        searchTerm,
        page,
        pageSize,
        storeType,
      );
      return result; // Keep the same return format
    } catch (error) {
      this.logger.error('Failed to retrieve nearest stores', error.stack);
      throw new HttpException({
        message: 'Failed to retrieve nearest stores',
        error: error.message,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/draw-road')
  async drawRoad(
    @Query('from') from: string,
    @Query('to') to: string,
  ): Promise<any> {
    try {
      const result = await this.storesService.drawRoad(from, to);
      return result; // Keep the same return format
    } catch (error) {
      this.logger.error('Failed to draw road', error.stack);
      throw new HttpException({
        message: 'Failed to draw road',
        error: error.message,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 10,
    @Query('searchTerm') searchTerm: string = '',
  ): Promise<any> {
    try {
      const result = await this.storesService.findAll(page, pageSize, searchTerm);
      return result; // Keep the same return format
    } catch (error) {
      this.logger.error('Failed to retrieve stores', error.stack);
      throw new HttpException({
        message: 'Failed to retrieve stores',
        error: error.message,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<any> {
    try {
      const store = await this.storesService.findOne(+id);
      return store; // Keep the same return format
    } catch (error) {
      this.logger.error('Store not found', error.stack);
      throw new HttpException({
        message: 'Store not found',
        error: error.message,
      }, HttpStatus.NOT_FOUND);
    }
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.STORE_OWNER, Role.STORE_STAFF, Role.STAFF)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateStoreDto: UpdateStoreDto,
  ): Promise<any> {
    try {
      const updatedStore = await this.storesService.update(+id, updateStoreDto);
      return updatedStore; // Keep the same return format
    } catch (error) {
      this.logger.error('Failed to update store', error.stack);
      throw new HttpException({
        message: 'Failed to update store',
        error: error.message,
      }, HttpStatus.BAD_REQUEST);
    }
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.STORE_OWNER, Role.STORE_STAFF, Role.STAFF)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<any> {
    try {
      await this.storesService.remove(+id);
      return {}; // Return an empty object or appropriate success response
    } catch (error) {
      this.logger.error('Failed to delete store', error.stack);
      throw new HttpException({
        message: 'Failed to delete store',
        error: error.message,
      }, HttpStatus.BAD_REQUEST);
    }
  }
}
