import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { PrimaryGeneratedColumn, Column } from 'typeorm';
import { Specialist } from 'src/specialists/entities/specialist.entity';
import { Service } from 'src/services/entities/service.entity';
import { StoreStatus } from '../enums/store.status.enum';
import { StoreType } from './storeType';
import { TimeSlot } from 'src/appointments/entities/timeslots.entity';
import { Booking } from 'src/bookings/entities/booking.entity';
import { Offer } from 'src/offers/entities/offer.entity';
import { Review } from 'src/reviews/entities/review.entity';

@Entity()
export class Store {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  status: StoreStatus;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location: { type: string; coordinates: number[] };

  @OneToMany(() => Booking, (booking) => booking.store)
  bookings: Booking[];

  @ManyToOne(() => StoreType, (storeType) => storeType.store)
  @JoinColumn({ name: 'storeType' })
  type: StoreType;

  @Column({ nullable: true })
  zipCode: string;

  @Column()
  state: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column()
  website: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column()
  facebookLink: string;

  @Column()
  instagramLink: string;

  @Column()
  twitterLink: string;

  @OneToMany(() => Specialist, (specialist) => specialist.store)
  specialists: Specialist[];

  @OneToMany(() => Service, (service) => service.store)
  services: Service[];

  @OneToMany(() => TimeSlot, (timeSlot) => timeSlot.store)
  timeSlots: TimeSlot[];

  @OneToMany(() => Offer, (offer) => offer.store)
  offers: Offer[];

  @OneToMany(() => Review, (review) => review.store)
  reviews: Review[];
}
