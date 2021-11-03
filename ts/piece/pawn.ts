/* eslint-disable max-classes-per-file */
const { BasePiece } = require("./piece");

type Direction = [number, number];
type Directions = Set<Direction>;

class Pawn extends BasePiece {
    dirs = new Set();

    move() {
        const dirs: Directions = Object.getPrototypeOf(this).dirs;
        return [...dirs].map(([dx, dy]) => [this.x + dx, this.y + dy]);
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
