// src/chat/rooms/rooms.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import { RoomsService } from './room.service';

@Controller('rooms')
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @Post()
  create(@Body() body: { name: string }) {
    return this.roomsService.create(body.name);
  }

  @Get()
  findAll() {
    return this.roomsService.findAll();
  }
}
