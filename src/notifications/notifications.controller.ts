import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import * as admin from 'firebase-admin';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async create(@Body() createNotificationDto:CreateNotificationDto) {
    const savedNotification = await this.notificationsService.createNotification(createNotificationDto);
    const notificationSend = await this.notificationsService.sendNotificationToDevice(createNotificationDto);
    const message = {
      savedNotification,
      notificationSend,
    };
    return message;
  }



  @Get('count')
  async notificationCount() :Promise<number> {
    try{
      const count = await this.notificationsService.countNotifications();
      return count;
    }catch(error){
      console.error('Failed to get notification count:', error);
      throw error;
    }
  }


  @Post(':id/mark-as-read')
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationsService.update(+id, updateNotificationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(+id);
  }
}
