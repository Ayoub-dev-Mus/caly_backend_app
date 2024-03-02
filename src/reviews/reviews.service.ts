import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ReviewsService {

  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) { }

  async create(createReviewDto: CreateReviewDto, user: User): Promise<Review> {
    try {
      createReviewDto.user = user;
      const newReview = this.reviewRepository.create(createReviewDto);
      Logger.log('New review', newReview);
      return await this.reviewRepository.save(newReview);
    } catch (error) {
      throw new Error('Failed to create review' +  error.message);
    }
  }

  async findAll(): Promise<Review[]> {
    try {
      return await this.reviewRepository.find({ relations: ['store', 'user'] });
    } catch (error) {
      // Handle error appropriately
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
      // Handle error appropriately
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
}
