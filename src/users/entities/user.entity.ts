
import { Entity } from "typeorm";

import {
    Contains,
    IsInt,
    Length,
    IsEmail,
    IsFQDN,
    IsDate,
    Min,
    Max,
    IsString,
} from "class-validator"

import { PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    @IsString()
    id: string;

    @Column()
    @IsString()
    @Length(4, 20)
    firstName: string;

    @Column()
    @IsString()
    @Length(4, 20)
    lastName: string;

    @Column({ unique: true })
    @IsString()
    @Length(4, 20)
    email: string;

    @Column()
    @IsString()
    @Length(4, 50)
    address: string;

    @Column()
    @IsString()
    @Length(4, 20)
    zipCode: string;

    @Column()
    @IsString()
    @Length(4, 20)
    state: string;

    @Column()
    @IsString()
    @Length(4)
    password: string;

    @Column()
    @IsString()
    @Length(8, 20)
    role: string;

    @Column({ nullable: true })
    @IsString()
    refreshToken: string;


}
