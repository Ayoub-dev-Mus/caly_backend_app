import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import * as admin from 'firebase-admin';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {

  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
  ) {}

  async sendNotificationToDevice(token: string, title: string, body: string) {
    const message = {
      token: token,
      notification: {
        title: title,
        body: body,
      },
      data: {
        title: title,
        body: body,
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

 async createNotification(token: string, title: string, body: string) {
    // Create and save the notification to the database
    const notification = new this.notificationModel({ token, title, body });
    const savedNotification = await notification.save();

    // After saving, attempt to send the notification to the device
    try {
      const sendResponse = await this.sendNotificationToDevice(token, title, body);
      console.log('Notification sent to device:', sendResponse);
    } catch (error) {
      console.error('Failed to send notification to device:', error);
      // You might choose to handle this error differently
      // For example, you could log this error and not throw, depending on your application's needs
      throw error;
    }

    return savedNotification;
  }

  create(createNotificationDto: CreateNotificationDto) {
    return 'This action adds a new notification';
  }


  findAll() {
    return `This action returns all notifications`;
  }

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return `This action updates a #${id} notification`;
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }
}
