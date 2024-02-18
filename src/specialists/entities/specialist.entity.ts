import { Service } from "src/services/entities/service.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Store } from 'src/stores/entities/store.entity';

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

    @Column()
    profilePicture: string;

    @ManyToMany(() => Service, service => service.specialists)
    @JoinTable()
    services: Service[];


    @ManyToOne(() => Store, store => store.specialists)
    store: Store;
}