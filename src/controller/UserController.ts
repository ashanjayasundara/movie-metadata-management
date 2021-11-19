import {Request, Response} from "express";
import {getRepository} from "typeorm";
import {validate} from "class-validator";

import {User} from "../entity/User";

export default class UserController {

    static findAllUsers = async (req: Request, res: Response) => {
        const userRepository = getRepository(User);
        const users = await userRepository.find({
            select: ["id", "username", "role"]
        });
        res.send(users);
    };

    static getUserById = async (req: Request, res: Response) => {
        const id: number = parseInt(req.params.id);
        const userRepository = getRepository(User);
        try {
            const user = await userRepository.findOneOrFail(id, {
                select: ["id", "username", "role"]
            });
            res.send(user);
        } catch (error) {
            res.status(404).send("User not found");
        }
    };

    static createUser = async (req: Request, res: Response) => {
        let {username, password, role} = req.body;
        let user = new User();
        user.username = username;
        user.password = password;
        user.role = role;

        const errors = await validate(user);
        if (errors.length > 0) {
            res.status(400).send(errors);
            return;
        }
        user.hashPassword();

        const userRepository = getRepository(User);
        try {
            await userRepository.save(user);
        } catch (e) {
            res.status(409).send("username already in use");
            return;
        }
        res.status(201).send("User created");
    };

    static updateUser = async (req: Request, res: Response) => {

        const {username, role, userId} = req.body;
        const userRepository = getRepository(User);
        let user;
        try {
            user = await userRepository.findOneOrFail(userId);
        } catch (error) {
            res.status(404).send("User not found");
            return;
        }

        user.username = username;
        user.role = role;
        const errors = await validate(user);
        if (errors.length > 0) {
            res.status(400).send(errors);
            return;
        }

        try {
            await userRepository.save(user);
        } catch (e) {
            res.status(409).send("username already in use");
            return;
        }
        res.status(204).send();
    };

    static deleteUser = async (req: Request, res: Response) => {
        const id = req.body.id;
        const userRepository = getRepository(User);
        let user: User;
        try {
            user = await userRepository.findOneOrFail(id);
        } catch (error) {
            res.status(404).send("User not found");
            return;
        }
        await userRepository.delete(id);
        res.status(204).send();
    };
}
