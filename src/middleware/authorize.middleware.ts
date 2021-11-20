import {Request, Response, NextFunction} from "express";
import {getRepository} from "typeorm";

import {User} from "../entity/User";
import {HttpResponseCodes} from "../utils";

export const authorizeRequest = (roles: Array<string>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const id = res.locals.jwtPayload.userId;
        const userRepository = getRepository(User);
        let user: User;
        try {
            user = await userRepository.findOneOrFail(id);
        } catch (error) {
            res.status(HttpResponseCodes.UNAUTHORIZED).send();
            return
        }
        if (roles.indexOf(user.role) > -1) next();
        else res.status(HttpResponseCodes.FORBIDDEN).send();
    };
};