import {Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, UpdateDateColumn} from "typeorm";
import {Length, IsNotEmpty} from "class-validator";
import * as bcrypt from "bcryptjs";

@Entity()
@Unique(["username"])
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    @Length(4, 20)
    username!: string;

    @Column()
    @Length(4, 250)
    password!: string;

    @Column()
    @IsNotEmpty()
    role!: string;

    @Column({type: 'timestamp', nullable: true})
    createdAt!: Date;

    @Column({type: 'timestamp', nullable: true})
    @UpdateDateColumn()
    updatedAt!: Date;

    hashPassword() {
        this.password = bcrypt.hashSync(this.password, 8);
    }

    checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
        return bcrypt.compareSync(unencryptedPassword, this.password);
    }
}