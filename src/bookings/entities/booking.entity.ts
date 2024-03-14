import { TimeSlot } from 'src/appointments/entities/timeslots.entity';
import { Service } from 'src/services/entities/service.entity';
import { Specialist } from 'src/specialists/entities/specialist.entity';
import { Store } from 'src/stores/entities/store.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateDateColumn, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';


@Entity()
export class Booking {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @OneToOne(() => TimeSlot, timeSlot => timeSlot.booking)
    timeSlot: TimeSlot;

    @ManyToOne(() => Store, store => store.bookings) // Many bookings belong to one store
    store: Store;


    @ManyToOne(() => Specialist, specialist => specialist.bookings)
    specialist: Specialist;

    @ManyToOne(() => User, user => user.bookings)
    user: User;

    @ManyToOne(() => Service, service => service.bookings)
    service: Service;
}
