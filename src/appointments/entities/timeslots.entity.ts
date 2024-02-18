import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Appointment } from "./appointment.entity";
import { Store } from "src/stores/entities/store.entity";

@Entity()
export class TimeSlot {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    time: string;

    @Column({ type: 'date', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
    date: Date

    @Column({ default: true })
    available: boolean;

    @ManyToOne(() => Store, store => store.timeSlots)
    store: Store;
}
