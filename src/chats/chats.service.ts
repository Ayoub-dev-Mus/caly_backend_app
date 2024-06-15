// src/chats/chats.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { ChatsGateway } from './chats.gateway';
import { Chat, ChatDocument } from './entities/chat.shema';
import { CreateChatDto } from './dto/create-chat.dto';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    private readonly userservice: UsersService
  ) { }

  async create(createChatDto: CreateChatDto): Promise<Chat> {
    const createdChat = new this.chatModel(createChatDto);
    const chat = await createdChat.save();
    return chat;
  }

  async findAllByStore(storeId: Types.ObjectId): Promise<Chat[]> {
    return this.chatModel.find({ store: storeId }).exec();
  }



  async findChatUsers(loggedInUserId: string): Promise<User[]> {
    const { users } = await this.userservice.findAll();


    console.log(users)
    const chats = await this.chatModel.find({
      $or: [
        { sender: new Types.ObjectId(loggedInUserId.toString()) },
        { receiver: new Types.ObjectId(loggedInUserId.toString()) }
      ]
    }).exec();


    const userSet = new Set<string>();
    chats.forEach(chat => {
      userSet.add(chat.sender.toString());
      userSet.add(chat.receiver.toString());
    });

    // Remove the logged-in user from the set
    userSet.delete(loggedInUserId.toString());

    // Map user IDs to UserDto objects
    const chatUsers = Array.from(userSet).map(userId => {
      const user = users.find(u => u.id.toString() === userId);
      if (user) {
        return {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,

          phoneNumber: user.phoneNumber,
        };
      }
      return null;
    }).filter(user => user !== null) as User[];

    return chatUsers;
  }


  async findAllInvolvingUser(storeId: number, userId: Types.ObjectId): Promise<any[]> {
    return this.chatModel.find({
      store: storeId,
      $or: [{ sender: userId }, { receiver: userId }],
    }).exec();
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
