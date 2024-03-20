// src/device-tokens/entities/device-token.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class DeviceToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;


}
