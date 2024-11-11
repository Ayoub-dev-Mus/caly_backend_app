import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Store } from 'src/stores/entities/store.entity';
import { User } from 'src/users/entities/user.entity';
import { ReviewResponse } from './reviewReponse';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  rating: number;

  @Column()
  comment: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.reviews)
  user: User;

  @ManyToOne(() => Store, (store) => store.reviews)
  store: Store;

  // Change this from @OneToMany to @OneToOne to allow only one response
  @OneToOne(() => ReviewResponse, (response) => response.review)
  @JoinColumn() // This tells TypeORM where to store the foreign key
  response: ReviewResponse;

  @BeforeInsert()
  async checkRating() {
    if (this.rating < 1 || this.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
  }

  @BeforeInsert()
  async checkComment() {
    if (this.comment.length < 5) {
      throw new Error('Comment must be at least 5 characters');
    }
  }
}
