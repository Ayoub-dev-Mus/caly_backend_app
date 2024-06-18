// src/chat/rooms/rooms.controller.ts
import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { RoomsService } from './room.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { HasRoles } from 'src/common/role.decorator';
import { Role } from 'src/users/enums/role';
import { GetUser } from 'src/common/jwtMiddlware';
import { User } from 'src/users/entities/user.entity';

@Controller('rooms')
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.USER)
  @Get('/all/:id')
  findAllChatWithUser(@GetUser() user:User) {
    return this.roomsService.getRoomsForUserWithLastMessage(user);
  }

  @Get()
  findAll() {
    return this.roomsService.findAll();
  }
}
