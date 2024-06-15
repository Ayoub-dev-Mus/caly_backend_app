// src/chats/chats.controller.ts
import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { Types } from 'mongoose';
import { CreateChatDto } from './dto/create-chat.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';

@ApiTags('chats')
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) { }

  @Post()
  async create(@Body() createChatDto: CreateChatDto) {
    return this.chatsService.create(createChatDto);
  }

  @Get('users/test')
  async findChatUsers(@Body() loggedInUser: { userId: string }): Promise<User[]> {
    return this.chatsService.findChatUsers(loggedInUser);
  }


  @Get('/clear')
  async clearChats(): Promise<void> {
    await this.chatsService.clearChats();
  }

  @Get('/refill')
  async refillChats(): Promise<void> {
    await this.chatsService.refillChats();
  }

  @Get(':storeId')
  async findAllByStore(@Param('storeId') storeId: string) {
    return this.chatsService.findAllByStore(storeId);
  }

  @Get(':storeId/:user1/:user2')
  async findAllBetweenUsers(
    @Param('storeId') storeId: string,
    @Param('user1') user1: string,
    @Param('user2') user2: string,
  ) {
    return this.chatsService.findAllBetweenUsers(
      storeId,
      user1,
      user2,
    );
  }
}
