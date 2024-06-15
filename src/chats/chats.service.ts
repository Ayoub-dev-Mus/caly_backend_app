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

  async findAllByStore(storeId: string): Promise<Chat[]> {
    return this.chatModel.find({ store: storeId }).exec();
  }


  async clearChats(): Promise<void> {
    try {
      await this.chatModel.deleteMany({});
      console.log('Chats cleared successfully.');
    } catch (error) {
      console.error('Error clearing chats:', error);
      throw error;
    }
  }
  async refillChats(): Promise<void> {
    try {
      // Clear existing chats
      await this.clearChats();

      // Refill chats with test data
      await this.populateChats();

      console.log('Chats refilled successfully.');
    } catch (error) {
      console.error('Error refilling chats:', error);
      throw error;
    }
  }

  private async populateChats(): Promise<void> {
    try {
      // Example: Create and save chats with existing user UUIDs
      // Replace UUIDs with actual UUIDs of existing users
      const chat1 = await this.create({
        sender: 'aecb394e-6400-4d9a-b9b1-c77cbb5502c8', // UUID of user1
        receiver: 'a29dc92c-786d-4d71-b9e9-1f5d734f7b23', // UUID of user2
        store: 1,
        message: 'Hello from user1 to user2',
      });

      const chat2 = await this.create({
        sender: 'a29dc92c-786d-4d71-b9e9-1f5d734f7b23', // UUID of user2
        receiver: 'aecb394e-6400-4d9a-b9b1-c77cbb5502c8', // UUID of user1
        store: 1,
        message: 'Hello from user2 to user1',
      });

      console.log('Chats created successfully:', chat1, chat2);
    } catch (error) {
      console.error('Error creating chats:', error);
      throw error;
    }
  }

  async findChatUsers(loggedInUser: { userId: string }): Promise<User[]> {
    const loggedInUserId = loggedInUser.userId;
    try {
      const { users } = await this.userservice.findAll();
      const chats = await this.chatModel.find({
        $or: [
          { sender: loggedInUserId },
          { receiver: loggedInUserId }
        ]
      }).exec();

      const userSet = new Set<string>();
      chats.forEach(chat => {
        userSet.add(chat.sender.toString());
        userSet.add(chat.receiver.toString());
      });

      // Remove the logged-in user from the set
      userSet.delete(loggedInUserId);

      // Map user IDs to User objects
      const chatUsers = Array.from(userSet).map(userId => {
        const user = users.find(u => u.id === userId);
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
    } catch (error) {
      console.error('Error finding chat users:', error);
      return [];
    }
  }

  async findAllInvolvingUser(storeId: number, userId: string): Promise<any[]> {
    return this.chatModel.find({
      store: storeId,
      $or: [{ sender: userId }, { receiver: userId }],
    }).exec();
  }


  async findAllBetweenUsers(storeId: string, user1: string, user2: string): Promise<Chat[]> {
    return this.chatModel.find({
      store: storeId,
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).exec();
  }
}
