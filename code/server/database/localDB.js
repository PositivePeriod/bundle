require("dotenv").config();

class LocalDB {
    static singleton;

    constructor() {
        if (!LocalDB.singleton) {
            this.database = new Map();
            this.initAccount();
            LocalDB.singleton = this;
        }
        return LocalDB.singleton;
    }

    initAccount() {
        const developer = { playerName: "DEVELOPER", playerID: process.env.DEVELOP_PLAYERID };
        this.setPlayer(developer);
        this.setPlayer({ playerName: "pop", playerID: "oMktTEz7K_rpB2u2XSl_w" });
        this.setPlayer({ playerName: "opo", playerID: "wh79rPbY7LrEimtuVJ79Z" });
    }

    // eslint-disable-next-line class-methods-use-this, no-console
    async start() { console.log("Start Connection"); }

    // eslint-disable-next-line class-methods-use-this, no-console
    async end() { console.log("End Connection"); }

    async setPlayer(playerInfo) {
        const { playerID, playerName } = playerInfo;
        const date = new Date();
        const player = {
            id: playerID,
            name: playerName,
            email: null,
            win_game: 0,
            lose_game: 0,
            join_date: date,
            last_date: date,
        };
        this.database.set(playerName, player);
        return { success: true, data: null };
    }

    async existName(playerName) {
        return { success: true, data: this.database.has(playerName) };
    }

    async getPlayerByName(playerName) {
        return {
            success: true,
            data: this.database.has(playerName) ? this.database.get(playerName) : null,
        };
    }

    async getPlayerByID(playerID) {
        let player = null;
        this.database.forEach((value) => { if (value.id === playerID) { player = value; } });
        return { success: true, data: player };
    }

    async updatePlayerByName(playerInfo) {
        const { playerName, key } = playerInfo;
        if (!this.database.has(playerName)) { return { success: true, data: null }; }
        switch (key) {
            case "win":
                this.database.get(playerName).win_game += 1;
                break;
            case "lose":
                this.database.get(playerName).lose_game += 1;
                break;
            case "date":
                this.database.get(playerName).last_date = new Date();
                break;
            default:
                break;
        }
        return { success: true, data: null };
    }
}

module.exports = { LocalDB };
