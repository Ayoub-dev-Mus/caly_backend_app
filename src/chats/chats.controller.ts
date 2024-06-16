// src/chat/messages/messages.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { MessagesService } from './chats.service';

@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) { }

  @Post()
  create(@Body() body: { roomId: string, sender: string, receiverId: string, content: string }) {
    return this.messagesService.create(body.roomId, body.sender, body.receiverId, body.content);
  }

  @Get(':roomId')
  findByRoom(@Param('roomId') roomId: string) {
    return this.messagesService.findByRoom(roomId);
  }
}
