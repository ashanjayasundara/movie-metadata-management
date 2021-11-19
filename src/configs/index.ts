import {createPool} from 'mysql';
import * as dotenv from 'dotenv';
const  ormConfig = require('../../ormconfig');
import { createConnection } from "typeorm";
dotenv.config();


export const connectionPool = createPool({
    port: parseInt(process.env.DB_PORT || "3306"),
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_SCHEME,
    connectionLimit: 10
});

export const ormConnectionPool = createConnection(ormConfig);
export const jwtSecret ={
    jwtSecret: process.env.JWT_SECRET || "User123",
    expire: process.env.TOKEN_EXPIRE || "1h"
};
