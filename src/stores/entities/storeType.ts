import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Store } from './store.entity';

@Entity()
export class StoreType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column()
  icon: string;

  @ManyToOne(() => Store, (store) => store.type)
  store: Store[];
}
