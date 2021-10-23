/* eslint-disable max-classes-per-file */
const { GamePiece } = require("./piece.js");

class Pawn extends GamePiece {
    static dir = new Set();

    move(width, height) {
        const valid = (x, y) => x >= 0 && x < width && y >= 0 && y < height;
        const dir = Pawn.dir.filter(([dx, dy]) => valid(this.x + dx, this.y + dy));
        return dir.map(([dx, dy]) => [this.x + dx, this.y + dy]);
    }
}

class UpPawn extends Pawn {
    static dir = new Set([[-1, 0], [1, 0], [0, 1]]);
}

class DownPawn extends Pawn {
    static dir = new Set([[-1, 0], [1, 0], [0, -1]]);
}

class OrthogonalPawn extends Pawn {
    static dir = new Set([[-1, 0], [1, 0], [0, -1], [0, 1]]);
}

class DiagonalPawn extends Pawn {
    static dir = new Set([[-1, -1], [-1, 1], [1, -1], [1, 1]]);
}

class AllPawn extends Pawn {
    static dir = new Set([[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]);
}

module.exports = { Pawn, UpPawn, DownPawn, OrthogonalPawn, DiagonalPawn, AllPawn };
