class ServerGameBoard {
    constructor(mapID) {
        this.width = width;
        this.height = height;
        this.map = null; // new GameMap(); - set get,
        this.color = null; // ????????????//

        this.turn = 1;
        this.players = null;

        this.map = Array.from(Array(this.width), () => new Array(this.height).fill(null));
        this.colorMap = Array.from(Array(this.width), () => new Array(this.height).fill(null));
        // left bottom (0,0), right bottom(width-1,0)
        // left top (0,height-1), right top(width-1,height-1)
        for (let i = 0; i < this.width; i++) {
            this.map[i][0] = "A";
            this.map[i][this.height - 1] = "B";
        }
        this.ended = false;
    }

    load() {

    }

    setPiece(pos) {

    }

    getPiece(pos) {

    }

    movePiece(from, to) {

    }

    deletePiece(pos) {

    }

    getAllBundle() {

    }

    getBundleFromPos() {

    }

    deleteBundle() {

    }

    checkWin() { }
}

module.exports = { ServerGameBoard };
