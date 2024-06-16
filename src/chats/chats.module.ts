// src/chat/chat.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from './entities/room.schema';
import { Message, MessageSchema } from './entities/chat.shema';
import { MessagesController } from './chats.controller';
import { RoomsController } from './room.controller';
import { ChatGateway } from './chats.gateway';
import { MessagesService } from './chats.service';
import { RoomsService } from './room.service';

@Module({
  imports: [

    MongooseModule.forFeature([{ name: Room.name, schema: RoomSchema }, { name: Message.name, schema: MessageSchema }]),

  ],
  providers: [
    RoomsService,
    MessagesService,
    ChatGateway,
  ],
  controllers: [
    RoomsController,
    MessagesController,
  ],
  exports: [],
})
export class ChatModule {}
