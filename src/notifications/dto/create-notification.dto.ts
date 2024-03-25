import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsDate, IsDateString } from 'class-validator';

export class CreateNotificationDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    message: string;

    @IsOptional()
    @IsDateString()
    readAt: Date;

    @IsNotEmpty()
    @IsDate()
    createdAt: Date;

    @IsNotEmpty()
    @IsString()
    fcmToken: string;

    @IsNotEmpty()
    @IsBoolean()
    sent: boolean;
}
