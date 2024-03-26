import { Service } from 'src/services/entities/service.entity';
import { Store } from 'src/stores/entities/store.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Offer {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  price: number;

  @Column()
  discount: number;

  @Column()
  duration: number;

  @ManyToOne(() => Store, (store) => store.offers)
  store: Store;

  @ManyToOne(() => Service, (service) => service.offers)
  service: Service;
}
