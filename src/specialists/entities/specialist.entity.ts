import { Service } from 'src/services/entities/service.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Store } from 'src/stores/entities/store.entity';
import { Booking } from 'src/bookings/entities/booking.entity';

@Entity()
export class Specialist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  specialty: string;

  @Column({ nullable: true })
  profilePicture: string;

  @ManyToMany(() => Service, (service) => service.specialists, { onDelete: 'SET NULL' })
  @JoinTable()
  services: Service[];

  @ManyToOne(() => Store, (store) => store.specialists, { onDelete: 'SET NULL' })
  store: Store;

  @OneToMany(() => Booking, (booking) => booking.specialist, { onDelete: 'SET NULL' })
  bookings: Booking[];
}
