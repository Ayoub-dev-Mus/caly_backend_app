import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import * as admin from 'firebase-admin';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SocketGateway } from 'src/socket/socket.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,

    private socketGateway: SocketGateway,
  ) {}

  async sendNotificationToDevices(notificationId: number , fcmTokens:string[]) {
    try {
      const notification = await this.notificationRepository.findOne({
        where: { id: notificationId },
      });

      if (!notification) {
        throw new NotFoundException(`Notification with ID ${notificationId} not found`);
      }

      const message = {
        notification: {
          title: notification.title,
        },
        data: {
          title: notification.title,
          message: notification.message,
        },
      };

      // Split the tokens into chunks if needed (to avoid payload size limits)
      const tokens = fcmTokens
      const chunkSize = 1000; // Firebase allows up to 1000 tokens per request
      const tokenChunks = [];

      for (let i = 0; i < tokens.length; i += chunkSize) {
        tokenChunks.push(tokens.slice(i, i + chunkSize));
      }

      const responses = [];

      for (const chunk of tokenChunks) {
        const response = await admin.messaging().sendToDevice(chunk, message);
        responses.push(response);
        console.log('Successfully sent message to devices:', response);
      }

      // Combine and return all responses
      return responses;
    } catch (error) {
      console.error('Failed to send messages:', error);
      throw error;
    }
  }

  async createNotification(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    try {
      const savedNotification = await this.notificationRepository.save(createNotificationDto);
      console.log('Notification saved and sent successfully:', savedNotification);
      return savedNotification;
    } catch (error) {
      console.error('Failed to create and send notification:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    try {
      await this.notificationRepository.update(notificationId, { read: true });
      this.socketGateway.emit('notificationCountUpdated', {
        count: await this.getUnreadNotificationCount(),
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  async getUnreadNotificationCount(): Promise<number> {
    try {
      return await this.notificationRepository.count({
        where: { read: false },
      });
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
