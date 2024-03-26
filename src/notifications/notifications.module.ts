import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification } from './entities/notification.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SocketModule } from 'src/socket/socket.module';
import { NotificationGateway } from './notification.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), SocketModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationGateway],
})
export class NotificationsModule {}
