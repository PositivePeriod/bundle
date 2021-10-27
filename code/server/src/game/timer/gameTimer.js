class GameTimer {
    constructor(players) {
        this.players = players;
        this.totalTime = new Map(this.players.map((player) => [player, 0]));
        this.lastDate = new Map(this.players.map((player) => [player, null]));
    }

    on(player) { this.lastDate.set(player, Date.now()); }

    off(player) {
        const time = Date.now() - this.lastDate.get(player);
        this.totalTime.set(player, this.totalTime.get(player) + time);
        return time;
    }

    read(player) { return this.totalTime.get(player); }
}

module.exports = { GameTimer };
