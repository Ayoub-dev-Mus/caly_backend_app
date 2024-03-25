import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import * as admin from 'firebase-admin';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationsService {

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async sendNotificationToDevice( createNotificationDto:CreateNotificationDto ) {
    const message = {
      token: createNotificationDto.fcmToken,
      notification: {
        title: createNotificationDto.title,
      },
      data: {
        title: createNotificationDto.title,
        message: createNotificationDto.message,
      },
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response);
      return response;
    } catch (error) {
      console.log('Error sending message:', error);
      throw error;
    }
  }

  async createNotification(createNotificationDto:CreateNotificationDto) {
    try {
      const savedNotification = await this.notificationRepository.save(createNotificationDto);
      return savedNotification;
    } catch (error) {
      console.error('Failed to send notification to device:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await this.notificationRepository.update(notificationId, { readAt: new Date() });
  }

  @Cron(CronExpression.EVERY_WEEK)
  async deleteOldNotifications() {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await this.notificationRepository.delete({ readAt: LessThan(oneWeekAgo) });
  }

  async findAll() {
    return this.notificationRepository.find();
  }

  async countNotifications():Promise<number> {

    const notifications = await this.notificationRepository.count();
    return notifications
  }

  async findOne(id: number) {
    const notification = await this.notificationRepository.findOne({where: {id: id}});
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto) {
    const notification = await this.findOne(id);
    // Update notification properties here
    // For example:
    // notification.title = updateNotificationDto.title;
    // notification.body = updateNotificationDto.body;
    return this.notificationRepository.save(notification);
  }

  async remove(id: number) {
    const notification = await this.findOne(id);
    return this.notificationRepository.remove(notification);
  }
}
