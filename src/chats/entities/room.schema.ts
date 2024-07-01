import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Room extends Document {
  @Prop()
  _id: string;

  @Prop()
  users: string[];

 @Prop({unique:true})
  usersKey: string;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
