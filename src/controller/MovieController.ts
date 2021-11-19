import {Request, Response} from "express";
import {Column, getRepository} from "typeorm";
import {validate} from "class-validator";
import {Movie} from "../entity/Movie";

export default class MovieController {

    static findAllMovies = async (req: Request, res: Response) => {
        const movieRepository = getRepository(Movie);
        const movies = await movieRepository.find({
            select: ["id", "title", "description", "thumbnail", "releaseDate"]
        });
        res.send(movies);
    };


    static getMovieById = async (req: Request, res: Response) => {
        const id: number = parseInt(req.params.id);
        const movieRepository = getRepository(Movie);
        try {
            const movie = await movieRepository.findOneOrFail(id, {
                select: ["id", "title", "description", "thumbnail", "releaseDate"]
            });
            res.send(movie);
        } catch (error) {
            res.status(404).send({
                ruleCode: 404,
                message: "Movie Not Found"
            });
        }
    };

    static createMovie = async (req: Request, res: Response) => {
        let {title, description, thumbnail, releaseDate} = req.body;
        let movie = new Movie();
        movie.title = title;
        movie.description = description;
        movie.thumbnail = thumbnail;
        movie.releaseDate = releaseDate;

        const errors = await validate(movie);
        if (errors.length > 0) {
            res.status(400).send(errors);
            return;
        }

        const movieRepository = getRepository(Movie);
        try {
            await movieRepository.save(movie);
        } catch (e) {
            res.status(409).send({
                ruleCode: 409,
                message: "Movie already in used"
            });
            return;
        }
        res.status(201).send({
            ruleCode: 201,
            message: "Movie created"
        });
    };

    static updateMovie = async (req: Request, res: Response) => {
        let {title, description, thumbnail, releaseDate, id} = req.body;
        const movieRepository = getRepository(Movie);
        let movie;
        try {
            movie = await movieRepository.findOneOrFail(id);
        } catch (error) {
            res.status(404).send({
                ruleCode: 201,
                message: "Movie Not Found"
            });
            return;
        }

        movie.title = title;
        movie.description = description;
        movie.thumbnail = thumbnail;
        movie.releaseDate = releaseDate;
        const errors = await validate(movie);
        if (errors.length > 0) {
            res.status(400).send(errors);
            return;
        }

        try {
            await movieRepository.save(movie);
        } catch (e) {
            res.status(409).send({
                ruleCode: 409,
                message: "Movie already in use"
            });
            return;
        }
        res.status(204).send({
            ruleCode: 204,
            message: "Movie Successfully updated"
        });
    };

    static deleteMovie = async (req: Request, res: Response) => {
        const id = req.body.id;
        const movieRepository = getRepository(Movie);
        let movie: Movie;
        try {
            movie = await movieRepository.findOneOrFail(id);
        } catch (error) {
            res.status(404).send({
                ruleCode: 404,
                message: "Movie not found"
            });
            return;
        }
        await movieRepository.delete(id);
        res.status(204).send({
            ruleCode: 204,
            message: "Movie Successfully deleted"
        });
    };
}
