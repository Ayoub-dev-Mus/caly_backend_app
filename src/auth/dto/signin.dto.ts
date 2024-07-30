import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
export class SignInDto {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  fcmToken?: string; // Optional field for FCM token
}