import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  fcmTokens: string[];
  title: string;
  message: string;
}
