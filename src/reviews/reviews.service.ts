import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { User } from 'src/users/entities/user.entity';
import { ReviewResponse } from './entities/reviewReponse';
import { CreateReviewResponseDto } from './dto/create-review-response.dto';
import { UpdateReviewResponseDto } from './dto/updareReviewResponseDto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(ReviewResponse)
    private reviewResponseRepository: Repository<ReviewResponse>,
  ) { }

  async create(createReviewDto: CreateReviewDto, user: User): Promise<Review> {
    try {
      createReviewDto.user = user;
      const newReview = this.reviewRepository.create(createReviewDto);
      Logger.log('New review', newReview);
      return await this.reviewRepository.save(newReview);
    } catch (error) {
      throw new Error('Failed to create review' + error.message);
    }
  }
  async patchReviewResponse(
    reviewResponseId: number,
    updateReviewResponseDto: UpdateReviewResponseDto,
    user: User,
  ): Promise<ReviewResponse> {
    // Find the review response
    const reviewResponse = await this.reviewResponseRepository.findOne({
      where: { id: reviewResponseId },
    });

    if (!reviewResponse) {
      throw new NotFoundException(`Review response with id ${reviewResponseId} not found`);
    }


    await this.reviewResponseRepository.update(reviewResponseId, updateReviewResponseDto);

    return await this.reviewResponseRepository.findOne({
      where: { id: reviewResponseId },
    });
  }

  async respondToReview(
    reviewId: number,
    createReviewResponseDto: CreateReviewResponseDto,
    user: User,
  ): Promise<ReviewResponse> {
    const review = await this.reviewRepository.findOne({ where: { id: reviewId }, relations: ['response'] });
    if (!review) {
      throw new NotFoundException(`Review with id ${reviewId} not found`);
    }

    const reviewResponse = new ReviewResponse();
    reviewResponse.response = createReviewResponseDto.response;
    reviewResponse.user = user;
    reviewResponse.review = review;

    return this.reviewResponseRepository.save(reviewResponse);
  }

  async getResponsesForReview(reviewId: number): Promise<ReviewResponse> {
    const review = await this.reviewResponseRepository.findOne({ where: { review: { id: reviewId } } });
    if (!review) {
      throw new NotFoundException(`Review with id ${reviewId} not found`);
    }

    console.log(review.response)

    return review;
  }

  async getStoreRating(storeId: number): Promise<any> {
    try {
      const reviews = await this.reviewRepository.find({
        where: { store: { id: storeId } },
      });

      const totalReviews = reviews.length;

      const totalRatings = reviews.reduce((acc, review) => acc + review.rating, 0);
      const averageRating = totalReviews > 0 ? totalRatings / totalReviews : 0;

      return {
        totalReviews,
        averageRating: parseFloat(averageRating.toFixed(2)), // Format to 2 decimal places
      };
    } catch (error) {
      throw new Error(`Failed to retrieve rating for store ${storeId}: ${error.message}`);
    }
  }

  async findAll(
    storeId?: number,
    limit: number = 10,
    offset: number = 0,
  ): Promise<Review[]> {
    try {
      const whereConditions: FindOptionsWhere<Review> = {};

      if (storeId) {
        whereConditions.store = { id: storeId };
      }

      const reviews = await this.reviewRepository.find({
        relations: ['store', 'user'],
        where: whereConditions,
        take: limit,
        skip: offset,
        select: {
          user: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
      });

      Logger.log('Reviews', reviews);

      return reviews;
    } catch (error) {
      throw new Error('Failed to fetch reviews');
    }
  }

  async findAllReviewsByStore(
    user: User,
    limit: number = 10,
    offset: number = 0,
  ): Promise<Review[]> {
    try {
      const whereConditions: FindOptionsWhere<any> = {
        store: { id: user.store },
      };

      const reviews = await this.reviewRepository.find({
        relations: ['store', 'user'],
        where: whereConditions,
        take: limit,
        skip: offset,
        select: {
          user: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          },
        },
      });

      Logger.log('Reviews', reviews);

      return reviews;
    } catch (error) {
      throw new Error('Failed to fetch reviews');
    }
  }


  async findOne(id: number): Promise<Review> {
    try {
      const review = await this.reviewRepository.findOne({ where: { id } });
      if (!review) {
        throw new NotFoundException(`Review with id ${id} not found`);
      }
      return review;
    } catch (error) {
      throw new Error(`Failed to fetch review with id ${id}`);
    }
  }

  async update(id: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
    try {
      const existingReview = await this.findOne(id);
      const updatedReview = Object.assign(existingReview, updateReviewDto);
      return await this.reviewRepository.save(updatedReview);
    } catch (error) {
      // Handle error appropriately
      throw new Error(`Failed to update review with id ${id}`);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.reviewRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Review with id ${id} not found`);
      }
    } catch (error) {
      // Handle error appropriately
      throw new Error(`Failed to remove review with id ${id}`);
    }
  }
  async deleteReviewResponse(reviewResponseId: number): Promise<void> {
    const result = await this.reviewResponseRepository.delete(reviewResponseId);
    if (result.affected === 0) {
      throw new NotFoundException(`Review response with id ${reviewResponseId} not found`);
    }
  }

  async getReviewStatistics(storeId: number): Promise<any> {
    try {
      // Fetch all reviews for the store
      const reviews = await this.reviewRepository.find({
        where: { store: { id: storeId } },
      });

      // Filter reviews with more than 5 characters in their comments
      const filteredReviews = reviews.filter(
        (review) => review.comment.length > 5,
      );

      // Calculate total reviews and total rating for filtered reviews
      const totalReviews = filteredReviews.length;

      // Calculate star ratings
      const starRatings = [0, 0, 0, 0, 0]; // [1-star, 2-star, 3-star, 4-star, 5-star]
      filteredReviews.forEach((review) => {
        starRatings[review.rating - 1]++;
      });

      const totalRatings = starRatings.reduce(
        (acc, val, index) => acc + (index + 1) * val,
        0,
      );

      // Calculate average rating based on total ratings count
      const averageRating = totalReviews > 0 ? totalRatings / totalReviews : 0;

      return {
        totalReviews,
        totalRatings,
        averageRating,
        starRatings: {
          '1-star': starRatings[0],
          '2-star': starRatings[1],
          '3-star': starRatings[2],
          '4-star': starRatings[3],
          '5-star': starRatings[4],
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to retrieve review statistics for store ${storeId}`,
      );
    }
  }
}
