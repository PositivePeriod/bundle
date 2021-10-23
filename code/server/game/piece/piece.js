class GamePiece {
    constructor(name, x, y) {
        this.name = name;
        this.x = x;
        this.y = y;
    }

    get data() {
        return new Map(["x", this.x], ["y", this.y]);
    }

    // move() { }

    // die() { }
}

module.exports = { GamePiece };
