// src/chat/rooms/rooms.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room } from './entities/room.schema';
import { v4 as uuidv4 } from 'uuid';
import { MessagesService } from './chats.service';
import { UsersService } from 'src/users/users.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<Room>,
    private messagesService: MessagesService, // Inject the MessagesService
    private userService: UsersService // Inject the UserService or your user service
  ) { }

  async createRoom(userIds: string[]): Promise<string> {
    // Sort user IDs alphabetically
    const sortedIds = userIds.sort();
    // Concatenate sorted IDs to generate room ID
    const roomId = sortedIds.join('_');

    // Check if room already exists
    const existingRoom = await this.roomModel.findOne({ _id: roomId });

    console.log(existingRoom)


    if (!existingRoom) {
      const room = new this.roomModel({ _id: roomId, users: sortedIds });

      await room.save();
    }
    console.log("Room already exist")
    return roomId;
  }
  async getRoomsForUser(userId: string): Promise<Room[]> {
    return this.roomModel.find({ users: userId }).exec();
  }

  async getRoomsForUserWithLastMessage(user: User): Promise<any[]> {
    const rooms = await this.roomModel.find({ users:user.id }).exec();
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


  async findAll(): Promise<any[]> {
    const rooms = await this.roomModel.find().exec();
    const roomsWithUsers = await Promise.all(rooms.map(async (room) => {
      const users = await this.userService.findUsersByIds(room.users);
      return {
        room,
        users: users.map(user => `${user.firstName} ${user.lastName}`)
      };
    }));
    return roomsWithUsers;
  }
}
