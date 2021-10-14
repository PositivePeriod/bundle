class GamePiece {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    get data() {
        return new Map(["x", this.x], ["y", this.y]);
    }

    move() { }

    die() { }
}

class Pawn extends GamePiece {
    static dir = new Set();

    constructor(x, y) {
        super(x, y);
    }

    get data() {
        return super.data;
    }

    move(width, height) {
        const move = [];
        for (const [dx, dy] of Pawn.dir) {
            if (this.x + dx >= 0 && this.x + dx < width && this.y + dy >= 0 && this.y + dy < height) {
                move.push([this.x + dx, this.y + dy]);
            }
        }
    }
}

class UpPawn extends Pawn { static dir = new Set([[-1, 0], [1, 0], [0, 1]]); }

class DownPawn extends Pawn { static dir = new Set([[-1, 0], [1, 0], [0, -1]]); }

class King extends Pawn { static dir = new Set([[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]); }
