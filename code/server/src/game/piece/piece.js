class GamePiece {
    constructor(name, x, y) {
        this.name = name;
        this.x = x;
        this.y = y;
    }

    get data() {
        return { x: this.x, y: this.y };
    }

    set pos(newPos) {
        [this.x, this.y] = newPos;
    }

    get pos() {
        return [this.x, this.y];
    }

    // move() { }

    // die() { }
}

module.exports = { GamePiece };
