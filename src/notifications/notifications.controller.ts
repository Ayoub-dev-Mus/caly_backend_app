import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  Logger,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ApiTags } from '@nestjs/swagger';
import { NotificationGateway } from './notification.gateway';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  @Post('push-notification')
  async createNotification(@Body() notificationData: any) {
    const notification = this.notificationGateway.emitToClient(
      'notification',
      notificationData,
    );

    Logger.log('Sending notification to client:', notification);
    return notification;
  }

  @Post()
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    try {
      const savedNotification =
        await this.notificationsService.createNotification(
          createNotificationDto,
        );

      const notificationSend =
        await this.notificationsService.sendNotificationToDevice(
          createNotificationDto,
        );

      console.log('test');
      const message = {
        savedNotification,
        notificationSend,
      };
      return message;
    } catch (error) {
      new HttpException('Failed to send notification to device:', error);
    }
  }

  @Get('count')
  async notificationCount(): Promise<number> {
    try {
      const count = await this.notificationsService.countNotifications();
      return count;
    } catch (error) {
      console.error('Failed to get notification count:', error);
      throw error;
    }
  }

  @Patch(':id/mark-as-read')
  async markAsRead(@Param('id') id: number) {
    return this.notificationsService.markNotificationAsRead(id);
  }

  @Get()
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(+id);
  }
}
