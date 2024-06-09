import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatsService } from './chats.service';
import { ChatsGateway } from './chats.gateway';
import { Chat, ChatSchema } from './entities/chat.shema';
import { ChatsController } from './chats.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),

  ],
  providers: [ChatsService, ChatsGateway],
  exports: [ChatsService,],
  controllers: [ChatsController],
})
export class ChatsModule { }
