import {Request, Response} from "express";
import {getRepository} from "typeorm";
import {validate} from "class-validator";
import {Movie} from "../entity/Movie";
import {getCurrentDate, HttpResponseCodes, makeDirectory} from "../utils";
import fs from 'fs';
import {UploadedFile} from "express-fileupload";
import {BulkUpload, BulkUploadActionTypes, BulkUploadResponse} from "../msg/bulkUpload";
import {appendToCsv} from "../utils/common";

export default class MovieController {

    static findAllMovies = async (req: Request, res: Response) => {
        const movieRepository = getRepository(Movie);
        const movies = await movieRepository.find({
            select: ["id", "title", "description", "thumbnail", "releaseDate"]
        });
        console.log(getCurrentDate());
        res.status(HttpResponseCodes.SUCCESS).send(movies);
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
            res.status(HttpResponseCodes.NOT_FOUND).send({
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
            res.status(HttpResponseCodes.BAD_REQUEST).send(errors);
            return;
        }

        const movieRepository = getRepository(Movie);
        try {
            await movieRepository.save(movie);
        } catch (e) {
            res.status(HttpResponseCodes.DUPLICATE_RECORD).send({
                ruleCode: 409,
                message: "Movie already in used"
            });
            return;
        }
        res.status(HttpResponseCodes.CREATED).send({
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
            res.status(HttpResponseCodes.NOT_FOUND).send({
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
            res.status(HttpResponseCodes.BAD_REQUEST).send(errors);
            return;
        }

        try {
            await movieRepository.save(movie);
        } catch (e) {
            res.status(HttpResponseCodes.DUPLICATE_RECORD).send({
                ruleCode: 409,
                message: "Movie already in use"
            });
            return;
        }
        res.status(HttpResponseCodes.NO_CONTENT).send({
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
            res.status(HttpResponseCodes.NOT_FOUND).send({
                ruleCode: 404,
                message: "Movie not found"
            });
            return;
        }
        await movieRepository.delete(id);
        res.status(HttpResponseCodes.NO_CONTENT).send({
            ruleCode: 204,
            message: "Movie Successfully deleted"
        });
    };

    static handleBulkUpload = async (request: Request, response: Response) => {
        if (request.files == undefined) {
            response.status(HttpResponseCodes.BAD_REQUEST).send({
                ruleCode: 400,
                message: "Attachment not found"
            });
        } else {
            let processorTask = new Promise(((resolve, reject) => {
                // @ts-ignore
                let movieDetails: UploadedFile = request.files?.movie;
                let path = makeDirectory("./tmp/bulkUploads/" + getCurrentDate());

                movieDetails.mv(path + "/" + movieDetails.name).then(() => {
                        console.log("file uploaded successfully");
                        let bulkData: BulkUpload = JSON.parse(fs.readFileSync(path + "/" + movieDetails.name, {
                            encoding: 'utf-8',
                            flag: 'r'
                        }));
                        if (bulkData.movies.length == 0) {
                            resolve("Empty Records");
                        } else {
                            let statusFile = appendToCsv((path + "/" + movieDetails.name.split(".")[0]) + "-status.csv", ["ACTION", "TITLE", "STATUS", "REASON"]);
                            bulkData.movies.forEach(async (value) => {
                                let response: BulkUploadResponse = await this.processBulkUploadData(bulkData.action, value);
                                appendToCsv(statusFile, [bulkData.action, value.title, response.success ? "SUCCESS" : "FAILED", response.reason]);
                            });
                            resolve({
                                status: 200,
                                filePath: statusFile,
                            });
                        }
                    }
                ).catch(reason => {
                    reject(reason);
                });

            })).then(data => {
                response.status(HttpResponseCodes.SUCCESS).send(data);
            }).catch(err => {
                response.status(HttpResponseCodes.INTERNAL_SERVER_ERROR).send(err);
            });
        }
    };

    static processBulkUploadData = async (action: BulkUploadActionTypes, data: Movie): Promise<BulkUploadResponse> => {
        try {
            switch (action) {
                case BulkUploadActionTypes.ADD:
                    return await this.bulkUploadMovieAdd(data);
                case BulkUploadActionTypes.UPDATE:
                    return await this.bulkUploadMovieUpdate(data);
                case BulkUploadActionTypes.DELETE:
                    return await this.bulkUploadMovieDelete(data);
                default:
                    return {
                        action: action,
                        movie: data,
                        reason: "INVALID_ACTION",
                        success: false
                    }
            }

        } catch (err) {
            return {
                action: action,
                movie: data,
                reason: "Failed to process request",
                success: false
            }
        }

    };

    static async bulkUploadMovieAdd(movie: Movie): Promise<BulkUploadResponse> {
        let result: BulkUploadResponse = {
            action: BulkUploadActionTypes.ADD,
            movie: movie,
            reason: "",
            success: true
        };

        const errors = await validate(movie);
        if (errors.length > 0) {
            result.success = false;
            result.reason = "Required Data not available";
            return result;
        }

        const movieRepository = getRepository(Movie);
        try {
            await movieRepository.save(movie);
        } catch (e) {
            result.success = false;
            result.reason = "Movie Data already available";
            return result;
        }
        result.reason = "Movie data added to database";
        return result;
    }

    static async bulkUploadMovieUpdate(movie: Movie): Promise<BulkUploadResponse> {
        let result: BulkUploadResponse = {
            action: BulkUploadActionTypes.UPDATE,
            movie: movie,
            reason: "",
            success: true
        };

        const movieRepository = getRepository(Movie);
        let existMovie;
        try {
            existMovie = await movieRepository.findOneOrFail({where: {title: movie.title}});
        } catch (error) {
            result.success = false;
            result.reason = "Movie Not Found";
            return result;
        }
        const errors = await validate(movie);
        if (errors.length > 0) {
            result.success = false;
            result.reason = "Required Data not available";
            return result;
        }

        try {
            await movieRepository.save(movie);
        } catch (e) {
            result.success = false;
            result.reason = "Failed to update records";
            return result;
        }
        result.reason = "Movie data has been updated";
        return result;
    }

    static async bulkUploadMovieDelete(movie: Movie): Promise<BulkUploadResponse> {
        let result: BulkUploadResponse = {
            action: BulkUploadActionTypes.UPDATE,
            movie: movie,
            reason: "",
            success: true
        };
        const movieRepository = getRepository(Movie);
        let existingMovie;
        try {
            existingMovie = await movieRepository.findOneOrFail({where: {title: movie.title}});
        } catch (error) {
            result.success = false;
            result.reason = "Movie Not Found";
            return result;
        }
        await movieRepository.delete(existingMovie.id);
        result.reason = "Movie data was deleted";
        return result;

    }
}
