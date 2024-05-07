import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { ChatsService } from './chats.service';
import { Chat } from './entities/chat.entity';


@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  create(@Body() createChatDto: CreateChatDto): Promise<Chat> {
    return this.chatsService.create(createChatDto);
  }

  @Get()
  findAll(): Promise<Chat[]> {
    return this.chatsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Chat> {
    return this.chatsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto): Promise<Chat> {
    return this.chatsService.update(id, updateChatDto);
  }


}
