import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { GetUser } from 'src/common/jwtMiddlware';
import { User } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Role } from 'src/users/enums/role';
import { HasRoles } from 'src/common/role.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateReviewResponseDto } from './dto/create-review-response.dto';
import { UpdateReviewResponseDto } from './dto/updareReviewResponseDto';
import { ReviewResponse } from './entities/reviewReponse';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.USER)
  @Post()
  async create(
    @Body() createReviewDto: CreateReviewDto,
    @GetUser() user: User,
  ) {
    return await this.reviewsService.create(createReviewDto, user);
  }

  @Get(':id/responses')
  getResponses(@Param('id') id: number) {
    return this.reviewsService.getResponsesForReview(id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.USER, Role.STORE_OWNER, Role.STORE_STAFF)
  @Patch('/response/:id')
  async patchReviewResponse(
    @Param('id') reviewResponseId: number,
    @Body() updateReviewResponseDto: UpdateReviewResponseDto,
    @GetUser() user: User,
  ) {

    const updatedReviewResponse = await this.reviewsService.patchReviewResponse(
      reviewResponseId,
      updateReviewResponseDto,
      user,
    );

    if (!updatedReviewResponse) {
      throw new NotFoundException(`Review response with id ${reviewResponseId} not found`);
    }

    return updatedReviewResponse;
  }

  @Get('store/:storeId/rating')
  async getStoreRating(@Param('storeId') storeId: number) {
    return this.reviewsService.getStoreRating(storeId);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.USER, Role.STORE_OWNER, Role.STORE_STAFF)
  @Post(':id/respond')
  respondToReview(
    @Param('id') id: number,
    @Body() createReviewResponseDto: CreateReviewResponseDto,
    @GetUser() user: User,
  ) {
    return this.reviewsService.respondToReview(id, createReviewResponseDto, user);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.USER, Role.STORE_OWNER, Role.STORE_STAFF)
  @Delete('response/:id')
  async deleteReviewResponse(@Param('id') reviewResponseId: number): Promise<void> {
    return this.reviewsService.deleteReviewResponse(reviewResponseId);
  }

  @Get()
  async findAll(
    @Query('storeId') storeId?: number,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return await this.reviewsService.findAll(storeId, limit, offset);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.STORE_OWNER)
  @Get('store')
  async findAllReviewByStore(@GetUser() user: User) {
    return await this.reviewsService.findAllReviewsByStore(user);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const review = await this.reviewsService.findOne(+id);
    if (!review) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }
    return review;
  }

  @Get('store/:storeId')
  async findByStoreId(@Param('storeId') storeId: string) {
    return await this.reviewsService.getReviewStatistics(+storeId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return await this.reviewsService.update(+id, updateReviewDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.reviewsService.remove(+id);
  }
}
