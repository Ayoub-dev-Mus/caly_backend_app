import { User } from "src/users/entities/user.entity";

export class CreateNotificationDto {

    title: string;

    message: string;

    token: string;

    body: string;

    read: boolean;

    createdAt: Date;
}
