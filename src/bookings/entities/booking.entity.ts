import { TimeSlot } from 'src/appointments/entities/timeslots.entity';
import { Service } from 'src/services/entities/service.entity';
import { Specialist } from 'src/specialists/entities/specialist.entity';
import { Store } from 'src/stores/entities/store.entity';
import { User } from 'src/users/entities/user.entity';
import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToOne,
  Column,
} from 'typeorm';
import { BookingStatus } from '../enum/booking.status';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @OneToOne(() => TimeSlot, (timeSlot) => timeSlot.booking, { onDelete: 'SET NULL' })
  timeSlot: TimeSlot;

  @ManyToOne(() => Store, (store) => store.bookings, { onDelete: 'SET NULL' }) // Many bookings belong to one store
  store: Store;

  @ManyToOne(() => Specialist, (specialist) => specialist.bookings, { onDelete: 'SET NULL' })
  specialist: Specialist;

  @Column({ nullable: true })
  status: BookingStatus

  @ManyToOne(() => User, (user) => user.bookings, { onDelete: 'SET NULL' })
  user: User;

  @ManyToOne(() => Service, (service) => service.bookings, { onDelete: 'SET NULL' })
  service: Service;
}
