import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpException } from '@nestjs/common';
import { SpecialistsService } from './specialists.service';
import { UpdateSpecialistDto } from './dto/update-specialist.dto';
import CreateSpecialistDto from './dto/create-specialist.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Specialists')
@Controller('specialists')
export class SpecialistsController {
  constructor(private readonly specialistsService: SpecialistsService) { }

  @Post()
  async create(@Body() createSpecialistDto: CreateSpecialistDto) {
    try {
      const createdSpecialist = await this.specialistsService.create(createSpecialistDto);
      return { success: true, data: createdSpecialist };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Get('store/:storeId')
  async findSpecialistsByStoreId(@Param('storeId') storeId: string) {
    try {
      const specialists = await this.specialistsService.findSpecialistsByStoreId(+storeId);
      return { success: true, data: specialists };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Get('service/:serviceId')
  async findSpecialistsByServiceId(@Param('serviceId') serviceId: string) {
    try {
      const specialists = await this.specialistsService.findSpecialistsByServiceId(+serviceId);
      return { success: true, data: specialists };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
  @Get()
  async findAll() {
    try {
      const specialists = await this.specialistsService.findAll();
      return { success: true, data: specialists };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const specialist = await this.specialistsService.findOne(+id);
      return { success: true, data: specialist };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateSpecialistDto: UpdateSpecialistDto) {
    try {
      const updatedSpecialist = await this.specialistsService.update(+id, updateSpecialistDto);
      return { success: true, data: updatedSpecialist };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.specialistsService.remove(+id);
      return { success: true, message: 'Specialist successfully deleted' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
