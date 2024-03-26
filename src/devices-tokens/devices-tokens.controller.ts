import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DevicesTokensService } from './devices-tokens.service';
import { RegisterTokenDto } from './dto/register-token-dto';
import { Role } from 'src/users/enums/role';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { HasRoles } from '../common/role.decorator';
import { GetUser } from 'src/common/jwtMiddlware';
import { User } from 'src/users/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('devices-tokens')
@Controller('devices-tokens')
export class DevicesTokensController {
  constructor(private readonly devicesTokensService: DevicesTokensService) { }




  @Post()
  create(@Body() createDevicesTokenDto: RegisterTokenDto,) {
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



  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.devicesTokensService.remove(+id);
  }
}
