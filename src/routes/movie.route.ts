import { Router } from "express";
import MovieController from "../controller/MovieController";
import { checkToken } from "../middleware/token-validate.middleware";
import { authorizeRequest } from "../middleware/authorize.middleware";

const router = Router();

router.get("/",  MovieController.findAllMovies);

router.get(
    "/:id([0-9]+)",
    MovieController.getMovieById
);

router.post("/", [checkToken, authorizeRequest(["ADMIN"])], MovieController.createMovie);


router.put("/",
    [checkToken, authorizeRequest(["ADMIN"])],
    MovieController.updateMovie
);

router.delete("/",
    [checkToken, authorizeRequest(["ADMIN"])],
    MovieController.deleteMovie
);

export default router;