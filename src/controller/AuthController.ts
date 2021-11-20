import {Request, Response} from "express";
import * as jwt from "jsonwebtoken";
import {getRepository} from "typeorm";
import {validate} from "class-validator";

import {User} from "../entity/User";
import {jwtSecret as Secret} from "../configs";
import {HttpResponseCodes} from "../utils";


export default class AuthController {
    static login = async (req: Request, res: Response) => {
        let {username, password} = req.body;
        if (!(username && password)) {
            res.status(HttpResponseCodes.NOT_FOUND).send();
        }

        const userRepository = getRepository(User);
        let user: User;
        try {
            user = await userRepository.findOneOrFail({where: {username: username}})
        } catch (error) {
            res.status(HttpResponseCodes.UNAUTHORIZED).send();
            return;
        }

        if (!user.checkIfUnencryptedPasswordIsValid(password)) {
            res.status(HttpResponseCodes.UNAUTHORIZED).send();
            return;
        }

        const token = jwt.sign(
            {userId: user.id, username: user.username, role: user.role},
            Secret.jwtSecret,
            {expiresIn: Secret.expire}
        );

        res.status(HttpResponseCodes.SUCCESS).send({ruleCode: 200, token: token});
    };

    static changeUserPassword = async (req: Request, res: Response) => {
        const id = res.locals.jwtPayload.userId;

        const {oldPassword, newPassword} = req.body;
        if (!(oldPassword && newPassword)) {
            res.status(HttpResponseCodes.BAD_REQUEST).send();
        }

        const userRepository = getRepository(User);
        let user: User;
        try {
            user = await userRepository.findOneOrFail(id);
        } catch (id) {
            res.status(HttpResponseCodes.UNAUTHORIZED).send();
            return;
        }

        if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
            res.status(HttpResponseCodes.UNAUTHORIZED).send();
            return;
        }

        user.password = newPassword;
        const errors = await validate(user);
        if (errors.length > 0) {
            res.status(HttpResponseCodes.BAD_REQUEST).send(errors);
            return;
        }
        user.hashPassword();
        await userRepository.save(user);

        res.status(HttpResponseCodes.NO_CONTENT).send();
    };
}
