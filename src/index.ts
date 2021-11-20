import "reflect-metadata";
import {createConnection} from "typeorm";
import fileUpload from 'express-fileupload';
import * as dotenv from 'dotenv';
import * as bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";
import routes from "./routes";
import {errorHandler} from "./middleware/error.middleware";
import {notFoundHandler} from "./middleware/not-found.middleware";
import {makeDirectory} from "./utils";
import express = require("express");

makeDirectory('./tmp/bulkUploads');

dotenv.config();
if (!process.env.SERVER_PORT)
    process.exit(1);

const SERVER_PORT: number = parseInt(process.env.SERVER_PORT);

createConnection()
    .then(async connection => {
        const application = express();
        application.use(fileUpload({createParentPath: true}));
        application.use(cors());
        application.use(helmet());
        application.use(bodyParser.json());
        application.use(bodyParser.urlencoded({extended: true}));

        application.use("/api", routes);

        application.use(errorHandler);
        application.use(notFoundHandler);
        application.listen(SERVER_PORT, () => {
            console.log("Server started on port ", SERVER_PORT);
        });
    })
    .catch(error => console.log(error));