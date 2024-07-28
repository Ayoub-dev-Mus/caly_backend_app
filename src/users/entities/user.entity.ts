import { CreateDateColumn, Entity, ManyToOne, OneToMany } from 'typeorm';

import { Length, IsString } from 'class-validator';

import { PrimaryGeneratedColumn, Column } from 'typeorm';
import { Booking } from 'src/bookings/entities/booking.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { Store } from 'src/stores/entities/store.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @IsString()
  id: string;

  @Column()
  @IsString()
  @Length(4, 20)
  firstName: string;

  @Column()
  @IsString()
  @Length(4, 20)
  lastName: string;

  @Column({ unique: true })
  @IsString()
  @Length(4, 20)
  email: string;

  @Column()
  @IsString()
  @Length(4, 50)
  address: string;

  @Column()
  @IsString()
  @Length(4, 20)
  zipCode: string;

  @Column()
  @IsString()
  @Length(4, 20)
  state: string;

  @Column()
  @IsString()
  @Length(4)
  password: string;

  @Column()
  @IsString()
  @Length(8, 20)
  role: string;

  @Column({ nullable: true })
  @IsString()
  profilePicture: string;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date;

  @Column({ nullable: true })
  @IsString()
  phoneNumber: string;

  @Column({ nullable: true })
  @IsString()
  fcmToken: string; 

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  createdAt: Date;

  @Column({ nullable: true })
  @IsString()
  refreshToken: string;

  @Column({ nullable: true })
  @IsString()
  resetPasswordToken: string;

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @ManyToOne(() => Store, (store) => store.staff)
  store: Store;

  @Column({ nullable: true })
  isOwner: boolean;

  @Column({ nullable: true })
  isStaff: boolean;
}
