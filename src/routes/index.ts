import {Router} from "express";
import auth from "./auth.route";
import user from "./user.route";
import movie from "./movie.route";

const routes = Router();

routes.use("/auth", auth);
routes.use("/user", user);
routes.use("/movie", movie);

export default routes;