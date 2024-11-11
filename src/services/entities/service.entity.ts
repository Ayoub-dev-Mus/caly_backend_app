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
  DeleteDateColumn,
} from 'typeorm';
import { Status } from '../enum/status';

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

  @Column({ nullable: true })
  status: Status;

  @ManyToOne(() => Store, (store) => store.services,{ onDelete: 'SET NULL' })
  @JoinColumn({ name: 'storeId' })
  store: Store;

  @ManyToMany(() => Specialist, (specialist) => specialist.services, { onDelete: 'SET NULL' })
  @JoinTable()
  specialists: Specialist[];

  @OneToMany(() => Booking, (booking) => booking.service, { onDelete: 'SET NULL' })
  bookings: Booking[];

  @OneToMany(() => Offer, (offer) => offer.service, { onDelete: 'SET NULL' })
  offers: Offer[];

  // Soft delete column for marking the service as deleted
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  // Method to soft delete the service
  softDelete() {
    this.deletedAt = new Date();
  }
}
