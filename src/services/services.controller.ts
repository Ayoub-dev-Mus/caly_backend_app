import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ApiTags } from '@nestjs/swagger';
import CreateServiceDto from './dto/create-service.dto';
import { HasRoles } from 'src/common/role.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Role } from 'src/users/enums/role';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) { }

  @Post()
  async create(@Body() createServiceDto: CreateServiceDto) {
    try {
      const createdService =
        await this.servicesService.create(createServiceDto);
      return { success: true, data: createdService };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }




  @Get()
  async findAll() {
    try {
      const services = await this.servicesService.findAll();
      return { success: true, data: services };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.USER)
  @Get('store/:storeId')
  findByStoreId(@Param('storeId') storeId: number) {
    return this.servicesService.findByStoreId(storeId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const service = await this.servicesService.findOne(+id);
      return { success: true, data: service };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    try {
      const updatedService = await this.servicesService.update(
        +id,
        updateServiceDto,
      );
      return { success: true, data: updatedService };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this.servicesService.remove(+id);
      return { success: true, message: 'Service successfully deleted' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
