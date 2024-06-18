// src/chat/messages/messages.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './entities/chat.shema';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
  ) { }

  create(roomId: string, sender: string, receiverId, content: string): Promise<Message> {
    const message = new this.messageModel({ roomId, sender, receiverId, content });
    return message.save();
  }

  async findLastMessageForRoom(roomId: string): Promise<Message | null> {
    return this.messageModel.findOne({ roomId }).sort({ createdAt: -1 }).exec();
  }

  async storeMessage(message: Message): Promise<void> {
    // Implement logic to store the message in the database
    await this.messageModel.create(message);
  }

  findByRoom(roomId: string): Promise<Message[]> {
    return this.messageModel.find({ roomId }).sort({ timestamp: 'asc' }).exec();
  }
}
