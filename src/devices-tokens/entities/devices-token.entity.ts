// src/device-tokens/entities/device-token.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DeviceToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;
}
