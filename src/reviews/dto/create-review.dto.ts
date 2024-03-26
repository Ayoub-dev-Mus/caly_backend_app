import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Store } from 'src/stores/entities/store.entity';
import { User } from 'src/users/entities/user.entity';

export class CreateReviewDto {
  @ApiProperty()
  rating: number;

  @ApiProperty()
  comment: string;

  @ApiProperty()
  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @Optional()
  @ApiProperty()
  user: User;

  @ApiProperty()
  store: Store;
}
