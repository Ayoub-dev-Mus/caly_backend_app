import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewResponse } from './entities/reviewReponse';

@Module({
  imports: [TypeOrmModule.forFeature([Review, ReviewResponse])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule { }
