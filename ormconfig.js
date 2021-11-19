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
        "src/entity/**/*.ts"
    ],
    "migrations": [
        "src/migration/**/*.ts"
    ],
    "subscribers": [
        "src/subscriber/**/*.ts"
    ],
    "cli": {
        "entitiesDir": "src/entity",
        "migrationsDir": "src/migration",
        "subscribersDir": "src/subscriber"
    }
};