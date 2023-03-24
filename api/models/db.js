const Sequelize = require('sequelize');

// require("dotenv").config();

// const { DB_NAME, PSQL_USER, PSQL_PASS, DB_PORT, DB_HOST } = process.env;

const db = new Sequelize('TMDB', null, null, {
    host: 'localhost',
    logging: false,
    dialect: 'postgres'
})

module.exports = db;