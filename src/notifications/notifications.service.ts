import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import * as admin from 'firebase-admin';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import serviceAccount from '../../src/config/mykey.json';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
    }
   }


  async sendNotificationToDevices(notificationId: number, fcmTokens: string[]) {
    try {
      const notification = await this.notificationRepository.findOne({
        where: { id: notificationId },
      });

      if (!notification) {
        throw new NotFoundException(`Notification avec l'ID ${notificationId} non trouvée`);
      }

      const message = {
        notification: {
          title: notification.title,
          body: notification.message,
        },
        data: {
          notificationId: notification.id.toString(),
          title: notification.title,
          message: notification.message,
        },
      };

      // Créer une requête multicast pour envoyer la notification à plusieurs appareils
      const multicastMessage = {
        tokens: fcmTokens,
        ...message,
      };

      const response = await admin.messaging().sendEachForMulticast(multicastMessage);

      this.logger.log(`Message envoyé avec succès: ${response.successCount} réussites, ${response.failureCount} échecs.`);

      await this.sendNotificationToFirebase(notification);

      const  savedNotif = await this.saveNotificationToFirestore(notification);

      return response;
    } catch (error) {
      this.logger.error('Échec de l\'envoi des messages:', error);
      throw error;
    }
  }


  async createNotification(
  createNotificationDto: CreateNotificationDto,
): Promise < Notification > {
  try {
    const savedNotification = await this.notificationRepository.save(createNotificationDto);
    this.logger.log('Notification saved successfully:', savedNotification);

    return savedNotification;
  } catch(error) {
    this.logger.error('Failed to create and send notification:', error);
    throw error;
  }
}

async sendNotificationToFirebase(notification: Notification): Promise<void> {
  const message = {
    notification: {
      title: notification.title,
      body: notification.message,
    },
    data: {
      title: notification.title,
      message: notification.message,
      notificationId: notification.id.toString(),
    },
    topic: 'notifications',
  };

  try {
    await admin.messaging().send(message);
    this.logger.log('Notification sent to Firebase successfully');
  } catch (error) {
    this.logger.error('Failed to send notification to Firebase:', error);
    throw error;
  }
}

  async markNotificationAsRead(notificationId: number): Promise < void> {
  try {
    await this.notificationRepository.update(notificationId, { read: true });

  } catch(error) {
    this.logger.error('Failed to mark notification as read:', error);
    throw error;
  }
}


  async getUnreadNotificationCount(): Promise < number > {
  try {
    return await this.notificationRepository.count({
      where: { read: false },
    });
  } catch(error) {
    this.logger.error('Failed to fetch unread notification count:', error);
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

  async saveNotificationToFirestore(notification: Notification): Promise < void> {
  const firebaseData = {
    id: notification.id.toString(),
    title: notification.title,
    message: notification.message,
    createdAt: notification.createdAt.toISOString(),
    read: false,
  };

  try {
    await admin.firestore().collection('notifications').doc().set({firebaseData});

    this.logger.log('Notification saved to Firestore successfully');
  } catch(error) {
    this.logger.error('Failed to save notification to Firestore:', error);
    throw error;
  }
}

  async countNotifications(): Promise < number > {
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
