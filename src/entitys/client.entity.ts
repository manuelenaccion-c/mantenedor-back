import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Client {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50})
    name: string;

    @Column({ length: 50})
    last_name: string;

    @Column({unique: true, length: 50})
    rut: string;

    @Column({unique: true, length: 50})
    email: string;

    @Column()
    gender: string

    @Column({default: true})
    status: boolean

    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date

}




