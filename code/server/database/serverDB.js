require("dotenv").config();
const { LocalDB } = require("./localDB.js");
const { PostgresqlDB } = require("./postgresqlDB.js");

const isDev = process.env.NODE_ENV === "development";
const ServerDB = isDev ? LocalDB : PostgresqlDB;
module.exports = { ServerDB };
