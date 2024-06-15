// src/dto/chat.dto.ts
import { Types } from 'mongoose';

export class CreateChatDto {
  senderId: string | Types.ObjectId;
  receiverId: string | Types.ObjectId;
  storeId: number;
  message: string;
  roomId: string;
}
