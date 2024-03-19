import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DevicesTokensService } from './devices-tokens.service';
import { CreateDevicesTokenDto } from './dto/create-devices-token.dto';
import { UpdateDevicesTokenDto } from './dto/update-devices-token.dto';

@Controller('devices-tokens')
export class DevicesTokensController {
  constructor(private readonly devicesTokensService: DevicesTokensService) {}

  @Post()
  create(@Body() createDevicesTokenDto: CreateDevicesTokenDto) {
    return this.devicesTokensService.create(createDevicesTokenDto);
  }

  @Get()
  findAll() {
    return this.devicesTokensService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.devicesTokensService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDevicesTokenDto: UpdateDevicesTokenDto) {
    return this.devicesTokensService.update(+id, updateDevicesTokenDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.devicesTokensService.remove(+id);
  }
}
