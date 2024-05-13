import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsGateway } from './chats.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from './entities/chat.entity';

@Module({
  imports: [MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),],
  providers: [ChatsGateway, ChatsService],
})
export class ChatsModule { }
