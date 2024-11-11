import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
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

  // Change this to a OneToOne relationship, and use @JoinColumn to define the foreign key
  @OneToOne(() => Review, (review) => review.response)
  @JoinColumn() // This defines the foreign key in the ReviewResponse table
  review: Review;

  @ManyToOne(() => User)
  user: User;
}
