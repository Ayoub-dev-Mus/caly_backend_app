import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import * as admin from 'firebase-admin';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,

  ) { }
  private  notificationGateway: NotificationGateway


  async sendNotificationToDevice(createNotificationDto: CreateNotificationDto) {
    try {
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

      Logger.log('Sending notification to device:', message);

      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response);
      return response;
    } catch (error) {
      throw error;
    }
  }
  async createNotification(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    try {
      const savedNotification = await this.notificationRepository.save(createNotificationDto);
      this.notificationGateway.emitToClient('notificationCountUpdated', { count: await this.getUnreadNotificationCount() });
      return savedNotification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    try {
      await this.notificationRepository.update(notificationId, { read: true });
      this.notificationGateway.emitToClient('notificationCountUpdated', { count: await this.getUnreadNotificationCount() });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  async getUnreadNotificationCount(): Promise<number> {
    try {
      return await this.notificationRepository.count({ where: { read: false } });
    } catch (error) {
      console.error('Failed to fetch unread notification count:', error);
      throw error;
    }
  }
  @Cron(CronExpression.EVERY_WEEK)
  async deleteOldNotifications() {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await this.notificationRepository.delete({
      read: true,
      readAt: LessThan(oneWeekAgo),
    });
  }

  async findAll() {
    return this.notificationRepository.find();
  }

  async countNotifications(): Promise<number> {
    const notifications = await this.notificationRepository.count({
      where: { read: false },
    });
    return notifications;
  }

  async findOne(id: number) {
    const notification = await this.notificationRepository.findOne({
      where: { id: id },
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  async remove(id: number) {
    const notification = await this.findOne(id);
    return this.notificationRepository.remove(notification);
  }
}
