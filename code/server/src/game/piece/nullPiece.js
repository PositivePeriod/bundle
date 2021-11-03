const { GamePiece } = require("./piece.js");

class WallPiece extends GamePiece {
    // eslint-disable-next-line class-methods-use-this
    move() { return []; }
}

module.exports = { WallPiece };
