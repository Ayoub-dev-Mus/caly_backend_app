import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationsService {



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
      const response = await admin.messaging(
        
      ).send(message);
      console.log('Successfully sent message:', response);
      return response;
    } catch (error) {
      console.log('Error sending message:', error);
      throw error;
    }
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
