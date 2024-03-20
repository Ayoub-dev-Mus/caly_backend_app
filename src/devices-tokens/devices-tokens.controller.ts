import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DevicesTokensService } from './devices-tokens.service';
import { RegisterTokenDto } from './dto/register-token-dto';
import { Role } from 'src/users/enums/role';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { HasRoles } from '../common/role.decorator';
import { GetUser } from 'src/common/jwtMiddlware';
import { User } from 'src/users/entities/user.entity';

@Controller('devices-tokens')
export class DevicesTokensController {
  constructor(private readonly devicesTokensService: DevicesTokensService) {}



  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.USER)
  @Post()
  create(@Body() createDevicesTokenDto: RegisterTokenDto , @GetUser() user: User) {
    return this.devicesTokensService.registerToken(createDevicesTokenDto , user);
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
