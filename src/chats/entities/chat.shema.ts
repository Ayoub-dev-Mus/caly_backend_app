// src/schemas/chat.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema()
export class Chat {
  @Prop({ type: String, required: true }) // Assuming sender and receiver IDs are string type
  senderId: string;

  @Prop({ type: String, required: true }) // Assuming sender and receiver IDs are string type
  receiverId: string;

  @Prop({ type: Number, required: true })
  storeId: number;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true }) // Assuming room ID is required for each chat
  roomId: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
