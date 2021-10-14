require("dotenv").config();
const { Client } = require("pg");

class DatabaseManager {
    constructor() {
        this.client = new Client({
            connectionString: process.env.POSTGRESQL_URI,
            ssl: { rejectUnauthorized: false },
        });
    }

    async test() {
        try {
            await this.client.connect();
        } catch (error) { console.log(error); }
        const command = "SELECT * FROM products";
        try {
            const res = await this.client.query(command);
            // console.log(res); // Hello world!
            await this.client.end();
        } catch (error) { console.log(error); }
        console.log("finished");
    }
}
new DatabaseManager().test();

module.exports = DatabaseManager;
