
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateReviewResponseDto {
  @IsString()
  @IsNotEmpty()
  response: string;
}
