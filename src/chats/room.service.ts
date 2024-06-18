// src/chat/rooms/rooms.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room } from './entities/room.schema';
import { v4 as uuidv4 } from 'uuid';
import { MessagesService } from './chats.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<Room>,
    private messagesService: MessagesService, // Inject the MessagesService
    private userService: UsersService // Inject the UserService or your user service
  ) { }

  async createRoom(userIds: string[]): Promise<string> {
    const roomId = uuidv4(); // Generate a UUID as room ID
    const existingRoom = await this.roomModel.findOne({ _id: roomId });

    if (!existingRoom) {
      // If the room doesn't exist, create it with the generated UUID and user IDs
      const room = new this.roomModel({ _id: roomId, users: userIds });
      await room.save();
    }

    return roomId;
  }

  async getRoomsForUser(userId: string): Promise<Room[]> {
    return this.roomModel.find({ users: userId }).exec();
  }

  async getRoomsForUserWithLastMessage(userId: string): Promise<any[]> {
    const rooms = await this.roomModel.find({ users: userId }).exec();
    const roomsWithLastMessage = await Promise.all(rooms.map(async (room) => {
      const users = await this.userService.findUsersByIds(room.users);
      const lastMessage = await this.messagesService.findLastMessageForRoom(room.id);
      return {
        room,
        users,
        lastMessage
      };
    }));
    return roomsWithLastMessage;
  }

  findAll(): Promise<Room[]> {
    return this.roomModel.find().exec();
  }
}
