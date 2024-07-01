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
    private messagesService: MessagesService,
    private userService: UsersService
  ) { }

  async createRoom(userIds: string[]): Promise<string> {
<<<<<<< HEAD
    // Sort user IDs alphabetically
    const sortedIds = [...userIds].sort();
    console.log('Sorted User IDs:', sortedIds);

    // Concatenate sorted IDs to generate a unique key for searching
    const sortedIdsKey = sortedIds.join('_');
    console.log('Generated usersKey:', sortedIdsKey);
=======
    const sortedIds = userIds.sort();
    const roomId = sortedIds.join('_');
    const existingRoom = await this.roomModel.findOne({ _id: roomId });
>>>>>>> b5cee03639da5f99467a320a98200eff20c62b87

    // Ensure that the room creation is an atomic operation
    const session = await this.roomModel.db.startSession();
    session.startTransaction();
    try {
      // Check if a room with the same users already exists
      const existingRoom = await this.roomModel.findOne({ usersKey: sortedIdsKey }).session(session);
      if (existingRoom) {
        console.log('Room already exists:', existingRoom);
        await session.commitTransaction();
        session.endSession();
        console.log(existingRoom._id)
        return existingRoom._id;
      }

      // Generate a new UUID for the room ID
      const roomId = uuidv4();

      // Create and save the new room
      const room = new this.roomModel({ _id: roomId, users: sortedIds, usersKey: sortedIdsKey });
      await room.save({ session });

      await session.commitTransaction();
      session.endSession();
      console.log('New room created:', room);
      console.log(roomId)
      return roomId;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async getRoomsForUser(userId: string): Promise<Room[]> {
    return this.roomModel.find({ users: userId }).exec();
  }

  async getRoomsForUserWithLastMessage(user: User): Promise<any[]> {
    const rooms = await this.roomModel.find({ users: user.id }).exec();
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

  async findRoomByUserIds(userIds: string[]): Promise<Room | null> {
    const sortedIdsKey = userIds.sort().join('_');
    const room = await this.roomModel.findOne({ usersKey: sortedIdsKey }).exec();
    return room;
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
