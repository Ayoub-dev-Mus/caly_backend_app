import { Specialist } from 'src/specialists/entities/specialist.entity';
import { Store } from 'src/stores/entities/store.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, JoinColumn, ManyToOne } from 'typeorm';




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

    @ManyToOne(() => Store, store => store.services)
    @JoinColumn({ name: 'storeId' })
    store: Store;

    @ManyToMany(() => Specialist, specialist => specialist.services)
    @JoinTable()
    specialists: Specialist[];
}