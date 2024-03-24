import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationSchema } from './entities/notification.entity';
import { Notification } from './entities/notification.entity';

@Module({
  imports: [MongooseModule.forFeature([{ schema: NotificationSchema, name: Notification.name}])],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule { }
