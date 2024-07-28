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
  HttpStatus,
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
  ) { }

  @Post('send/:id')
  async sendNotification(
    @Param('id') notificationId: number,
    @Body('fcmTokens') fcmTokens: string[],
  ) {
    try {
      const responses = await this.notificationsService.sendNotificationToDevices(notificationId, fcmTokens);
      return {
        status: 'success',
        responses,
      };
    } catch (error) {
      Logger.error('Failed to send notification', error.stack);
      throw error;
    }
  }
@Post()
async create(@Body() createNotificationDto: CreateNotificationDto) {
  try {
    const savedNotification =
      await this.notificationsService.createNotification(
        createNotificationDto,
      );

    const notificationPayload = {
      title: createNotificationDto.title,
      body: createNotificationDto.message,
    };

    const message = {
      notification: notificationPayload,
    };

    return message;
  } catch (error) {
    Logger.error('Failed to send notification to device:', error);
    throw new HttpException(
      'Failed to send notification to device',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

@Get('count')
async notificationCount(): Promise < number > {
  try {
    const count = await this.notificationsService.countNotifications();
    return count;
  } catch(error) {
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
