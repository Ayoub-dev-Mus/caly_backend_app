// src/chat/rooms/room.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Room extends Document {
  @Prop({ required: true })
  name: string;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
