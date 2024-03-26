import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string; // Title of the notification

  @Column({ nullable: true })
  message: string; // Message body of the notification

  @Column({ nullable: true })
  readAt: Date; // Timestamp of when the notification was read

  @CreateDateColumn()
  createdAt: Date; // Timestamp of when the notification was created

  @Column({ nullable: false })
  fcmToken: string; // FCM token to which the notification was sent

  @Column({ default: false })
  sent: boolean; // Whether the notification has been sent

  @Column({ default: false })
  read: boolean; // Whether the notification has been read

  // Uncomment and adapt if you're associating notifications with specific users
  // @ManyToOne(() => User, user => user.notifications)
  // @JoinColumn({ name: 'userId' })
  // user: User;
}
