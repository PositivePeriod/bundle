/* eslint-disable max-classes-per-file */
const { GamePiece } = require("./piece.js");

class Pawn extends GamePiece {
    move(width, height) {
        // no validation
        const { dir } = Object.getPrototypeOf(this).constructor;
        return [...dir].map(([dx, dy]) => (
            { from: [this.x, this.y], to: [this.x + dx, this.y + dy] }));
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
