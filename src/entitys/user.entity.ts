import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true, length: 50})
    email: string;

    @Column()
    password: string

}