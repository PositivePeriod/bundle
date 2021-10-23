require("dotenv").config();
const { Pool } = require("pg");

class PostgresqlDB {
    static singleton;

    constructor() {
        if (!PostgresqlDB.singleton) { this.start(); PostgresqlDB.singleton = this; }
        return PostgresqlDB.singleton;
    }

    async start() {
        this.pool = await new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 0,
            idleTimeoutMillis: 10000,
            max: 1,
        });
        console.log("Start Connection");
    }

    async end() {
        await this.pool.end();
        console.log("End Connection");
    }

    async execute(command) {
        if (this.pool.ended) { await this.start(); }
        try {
            return { success: true, data: await this.pool.query(command) };
        } catch (error) {
            console.log("Postgresql DB Error : ", error);
            return { success: false, data: null };
        }
    }

    async setPlayer(playerInfo) {
        const { playerID, playerName } = playerInfo;
        const date = new Date().toISOString();
        const command = `INSERT INTO accounts VALUES('${playerID}', '${playerName}', NULL, 0, 0, '${date}', '${date}')`;
        const { success } = await this.execute(command);
        return { success, data: null };
    }

    async existName(playerName) {
        const command = `SELECT * FROM accounts WHERE name LIKE '${playerName}'`;
        const { success, data } = await this.execute(command);
        if (success) {
            return { success: true, data: data.rows.length === 1 };
        } return { success: false, data: null };
    }

    async getPlayerByName(playerName) {
        const command = `SELECT * FROM accounts WHERE name LIKE '${playerName}'`;
        const { success, data } = await this.execute(command);
        if (success) {
            return { success: true, data: data.rows.length !== 0 ? data.rows[0] : null };
        } return { success: false, data: null };
    }

    async getPlayerByID(playerID) {
        const command = `SELECT * FROM accounts WHERE id LIKE '${playerID}'`;
        const { success, data } = await this.execute(command);
        if (success) {
            return { success: true, data: data.rows.length !== 0 ? data.rows[0] : null };
        } return { success: false, data: null };
    }

    async updatePlayerByName(playerInfo) {
        const { playerName, key } = playerInfo;
        let command;
        switch (key) {
            case "win":
                command = `UPDATE accounts SET win_game = win_game + 1 WHERE name LIKE '${playerName}'`;
                break;
            case "lose":
                command = `UPDATE accounts SET lose_game = lose_game + 1 WHERE name LIKE '${playerName}'`;
                break;
            case "date":
                command = `UPDATE accounts SET last_date = ${new Date().toISOString()} WHERE name LIKE '${playerName}'`;
                break;
            default:
                command = null; break;
        }
        if (command === null) { return { success: true, data: null }; }
        const { success } = await this.execute(command);
        return { success, data: null };
    }
}

module.exports = { PostgresqlDB };
