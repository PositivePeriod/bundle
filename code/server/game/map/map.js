const { IDtoPiece } = require("../piece/pieceDict.js");

class ServerGameMap {
    constructor() {
        this.map = [];
    }

    save() { // TODO use DB and save as mapName.json
        this.map = null;
    }

    load(mapName) {
        // TODO use DB
        // eslint-disable-next-line global-require, import/no-dynamic-require
        const { width, height, playerNum, data } = require(`./${mapName}.json.js`);
        this.width = width;
        this.height = height;
        this.playerNum = playerNum;
        this.map = data.map((row) => row.split(" ").map((cell) => {
            // maxium 14 players; since N is already used for null
            const name = cell.substring(1);
            const Piece = IDtoPiece(parseInt(cell.substring(1), 10));
            return Piece === null ? null : new Piece(name, );
        }));
    }

    setPlayers(players) {

    }
}

module.exports = ServerGameMap;
