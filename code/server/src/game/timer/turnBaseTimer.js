const { GameTimer } = require("./gameTimer.js");

class TurnBaseTimer extends GameTimer {
    constructor(players, turnMax) {
        super(players);
        this.turnMax = turnMax;
        this.alive = new Map(this.players.map((player) => [player, true]));
    }

    off(player) {
        const time = super.off(player);
        if (this.turnMax < time) { this.alive.set(player, false); }
        return time;
    }

    live(player) { return this.alive.get(player); }
}

module.exports = { TurnBaseTimer };
