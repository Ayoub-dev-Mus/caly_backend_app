import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    title: string; // Title of the notification

    @Column({ nullable: true })
    message: string; // Message body of the notification

    @Column({ nullable: true })
    userId: number; // Assuming you are referencing a User model

    @Column({ default: false })
    read: boolean; // Flag to track if the notification has been read

    @CreateDateColumn()
    createdAt: Date; // Timestamp of when the notification was created
}
