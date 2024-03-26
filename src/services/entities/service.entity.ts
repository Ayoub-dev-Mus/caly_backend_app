import { Booking } from 'src/bookings/entities/booking.entity';
import { Offer } from 'src/offers/entities/offer.entity';
import { Specialist } from 'src/specialists/entities/specialist.entity';
import { Store } from 'src/stores/entities/store.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('double precision')
  price: number;

  @Column()
  icon: string;

  @ManyToOne(() => Store, (store) => store.services)
  @JoinColumn({ name: 'storeId' })
  store: Store;

  @ManyToMany(() => Specialist, (specialist) => specialist.services)
  @JoinTable()
  specialists: Specialist[];

  @OneToMany(() => Booking, (booking) => booking.service)
  bookings: Booking[];

  @OneToMany(() => Offer, (offer) => offer.service)
  offers: Offer[];
}
