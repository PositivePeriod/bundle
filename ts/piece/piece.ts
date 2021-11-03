interface Piece {
    name: string,
    x: number,
    y: number,
    move?: () => number[]
}

class BasePiece implements Piece {
    name: string;

    x: number;

    y: number;

    constructor(name: string, x: number, y: number) {
        this.name = name;
        this.x = x;
        this.y = y;
    }
}

module.exports = { Piece ,BasePiece };
