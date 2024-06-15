import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatsService } from './chats.service';
import { ChatsGateway } from './chats.gateway';
import { Chat, ChatSchema } from './entities/chat.shema';
import { ChatsController } from './chats.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
    UsersModule

  ],
  providers: [ChatsService, ChatsGateway , UsersModule],
  exports: [ChatsService,],
  controllers: [ChatsController],
})
export class ChatsModule { }
