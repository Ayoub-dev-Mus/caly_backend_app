import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateChatDto } from './dto/create-chat.dto';
import { Chat } from './entities/chat.entity';
import { UpdateChatDto } from './dto/update-chat.dto';

@Injectable()
export class ChatsService {
  constructor(@InjectModel(Chat.name) private readonly chatModel: Model<Chat>) {}

  async create(createChatDto: CreateChatDto): Promise<Chat> {
    const createdChat = new this.chatModel(createChatDto);
    return await createdChat.save();
  }

  async findAll(): Promise<Chat[]> {
    return await this.chatModel.find().exec();
  }

  async findOne(id: string): Promise<Chat> {
    return await this.chatModel.findById(id).exec();
  }

  async update(id: string, updateChatDto: UpdateChatDto): Promise<Chat> {
    return await this.chatModel.findByIdAndUpdate(id, updateChatDto, { new: true }).exec();
  }

}
