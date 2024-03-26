import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  message: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNotEmpty()
  @IsString()
  fcmToken: string;
}
