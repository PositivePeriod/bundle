const { GameTimer } = require("./gameTimer.js");

class ShieldBaseTimer extends GameTimer {
    constructor(players, shieldMax, healthMax) {
        super(players);
        this.shieldMax = shieldMax;
        this.healthMax = healthMax;
        this.alive = new Map(this.players.map((player) => [player, true]));
        this.shield = new Map(this.players.map((player) => [player, shieldMax]));
        this.health = new Map(this.players.map((player) => [player, healthMax]));
    }

    off(player) {
        const time = super.off(player);
        this.health.set(player, this.health.get(player) - Math.max(this.shield - time, 0));
        if (this.shield < time || this.health < 0) { this.alive.set(player, false); }
        return time;
    }

    live(player) { return this.alive.get(player); }
}

module.exports = { ShieldBaseTimer };
