import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Room extends Document {
  @Prop({ required: true })
  roomId: string;

  @Prop({ required: true })
  users: string[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);
