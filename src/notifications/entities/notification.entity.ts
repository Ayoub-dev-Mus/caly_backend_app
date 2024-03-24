import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema()
export class Notification {
    @Prop({ required: true })
    title: string; // Title of the notification

    @Prop({ required: false })
    message: string; // Message body of the notification

    @Prop()
    userId: Types.ObjectId; // Assuming you are referencing a User model

    @Prop()
    read: boolean; // Flag to track if the notification has been read

    @Prop({ default: Date.now })
    createdAt: Date; // Timestamp of when the notification was created


}
export const NotificationSchema = SchemaFactory.createForClass(Notification);