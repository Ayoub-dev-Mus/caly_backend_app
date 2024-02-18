import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { TimeSlot } from "./timeslots.entity";

@Entity()
export class Appointment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    date: Date;

    @Column()
    status: string;

}