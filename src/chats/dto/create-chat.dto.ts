// src/dto/create-chat.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateChatDto {
  @IsNotEmpty()
  sender: string;

  @IsNotEmpty()
  receiver: string;

  @IsNotEmpty()
  store: number;

  @IsNotEmpty()
  @IsString()
  message: string;
}
