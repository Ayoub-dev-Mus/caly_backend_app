import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DevicesTokensService } from './devices-tokens.service';
import { UpdateDevicesTokenDto } from './dto/update-devices-token.dto';
import { RegisterTokenDto } from './dto/register-token-dto';

@Controller('devices-tokens')
export class DevicesTokensController {
  constructor(private readonly devicesTokensService: DevicesTokensService) {}

  @Post()
  create(@Body() createDevicesTokenDto: RegisterTokenDto) {
    return this.devicesTokensService.registerToken(createDevicesTokenDto);
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
