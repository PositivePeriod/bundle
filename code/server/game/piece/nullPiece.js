const { GamePiece } = require("./piece.js");

class NullPiece extends GamePiece {
    constructor(x, y) {
        super(null, x, y);
    }

    // eslint-disable-next-line class-methods-use-this
    move() { return []; }
}

module.exports = { NullPiece };
