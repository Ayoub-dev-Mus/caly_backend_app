// src/dto/create-chat.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateChatDto {
  @IsNotEmpty()
  sender: Types.ObjectId;

  @IsNotEmpty()
  receiver: Types.ObjectId;

  @IsNotEmpty()
  store: Types.ObjectId;

  @IsNotEmpty()
  @IsString()
  message: string;
}
