import {getRepository, MigrationInterface, QueryRunner} from "typeorm";
import {User} from "../entity/User";

export class UserMigration1637327770932 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        let user = new User();
        user.username = "admin";
        user.password = "admin";
        user.hashPassword();
        user.role = "ADMIN";

        let user1 = new User();
        user1.username = "user";
        user1.password = "user";
        user1.hashPassword();
        user1.role = "USER";
        const userRepository = getRepository(User);
        await userRepository.save(user1);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
