const dotEnv = require('dotenv');
dotEnv.config();

module.exports = {
    "type": "mysql",
    "host":  process.env.DB_HOST,
    "port": parseInt(process.env.DB_PORT || "3306"),
    "username":  process.env.DB_USER,
    "password": process.env.DB_PASS,
    "database": process.env.DB_SCHEME,
    "synchronize": true,
    "logging": false,
    "entities": [
        "dist/entity/**/*.js"
    ],
    "migrations": [
        "dist/migration/**/*.js"
    ],
    "subscribers": [
        "dist/subscriber/**/*.js"
    ],
    "cli": {
        "entitiesDir": "dist/entity",
        "migrationsDir": "dist/migration",
        "subscribersDir": "dist/subscriber"
    }
};