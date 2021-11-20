import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Movie {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({unique: true})
    title!: string;

    @Column()
    description!: string;

    @Column()
    thumbnail!: string;

    @Column({type: 'timestamp', nullable: true})
    releaseDate!: Date;
}
