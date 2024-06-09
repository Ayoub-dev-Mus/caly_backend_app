// src/chats/chats.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { ChatsGateway } from './chats.gateway';
import { Chat, ChatDocument } from './entities/chat.shema';
import { CreateChatDto } from './dto/create-chat.dto';

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    private readonly chatsGateway: ChatsGateway,
  ) { }

  async create(createChatDto: CreateChatDto): Promise<Chat> {
    const createdChat = new this.chatModel(createChatDto);
    const chat = await createdChat.save();
    this.chatsGateway.emitToRoom(chat.store.toString(), 'newMessage', chat);
    return chat;
  }

  async findAllByStore(storeId: Types.ObjectId): Promise<Chat[]> {
    return this.chatModel.find({ store: storeId }).exec();
  }

  async findAllBetweenUsers(storeId: Types.ObjectId, user1: Types.ObjectId, user2: Types.ObjectId): Promise<Chat[]> {
    return this.chatModel.find({
      store: storeId,
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).exec();
  }
}
