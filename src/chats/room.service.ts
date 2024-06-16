// src/chat/rooms/rooms.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room } from './entities/room.schema';

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<Room>,
  ) {}

  create(name: string): Promise<Room> {
    const room = new this.roomModel({ name });
    return room.save();
  }

  findAll(): Promise<Room[]> {
    return this.roomModel.find().exec();
  }
}
