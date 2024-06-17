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
import { ApiTags } from '@nestjs/swagger';
import { CreateReviewResponseDto } from './dto/create-review-response.dto';

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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @HasRoles(Role.ADMIN, Role.USER , Role.STORE_OWNER , Role.STORE_STAFF)
  @Post(':id/respond')
  respondToReview(
    @Param('id') id: number,
    @Body() createReviewResponseDto: CreateReviewResponseDto,
    @GetUser() user: User,
  ) {
    return this.reviewsService.respondToReview(id, createReviewResponseDto, user);
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
