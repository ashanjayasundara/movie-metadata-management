import {Request, Response, NextFunction} from "express";
import * as jwt from "jsonwebtoken";
import {jwtSecret as Secret} from "../configs";

export const checkToken = (req: Request, res: Response, next: NextFunction) => {
    const token = <string>req.headers["auth"];
    let jwtPayload;
    try {
        jwtPayload = <any>jwt.verify(token, Secret.jwtSecret);
        res.locals.jwtPayload = jwtPayload;
    } catch (error) {
        res.status(401).send();
        return;
    }

    const {userId, username, role} = jwtPayload;
    const newToken = jwt.sign({userId, username, role}, Secret.jwtSecret, {
        expiresIn: Secret.expire
    });
    res.setHeader("token", newToken);
    next();
};