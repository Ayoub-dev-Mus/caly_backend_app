import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
  } from 'typeorm';
  import { Review } from './review.entity';
  import { User } from 'src/users/entities/user.entity';

  @Entity()
  export class ReviewResponse {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    response: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Review, (review) => review.responses)
    review: Review;

    @ManyToOne(() => User)
    user: User;
  }
  