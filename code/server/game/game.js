const { nanoid } = require("nanoid");
const { ServerGameBoard } = require("./board_");
    constructor(info) {
        this.id = nanoid();
        this.players = info.players;
        this.players.forEach(player => {
            this.players
        })
        this.map = new ServerGameBoard();
        this.map.load(info.mapID);

        this.timer = null;

        this.result = { winner: null, loser: null, unknown: null };
    }

    start() {

    }

    finish() {

    }

    show() {
        const data = { turn: board.turn, pieceMap: this.map };
    }

    play() {
        const board = new ServerGameBoard(width, height, socketA, socketB);
        gameBoard.set(gameID, board);
        let bundle = board.findBundles(board.I)[0];
        while (gameBoard.has(gameID) && !board.ended) {
            const [I, you] = [board.I, board.you];
            let moves = board.findBundleMove(I, bundle); // already chosen bundle
            if (moves.length === 0) {
                board.deleteBundle(I, bundle);
                if (board.checkNoPiece(I)) { await win(gameID, you.playerName); return; }

                bundle = board.findPieces(I); // use all pieces as bundle in pieces
                moves = board.findBundleMove(I, bundle);
                if (moves.length === 0) { await win(gameID, you.playerName); return; }
            }
            board.color("need", "noNeed");
            board.colorBundle(I.name, bundle);
            show(gameID);
            alertSocket(gameID, "status", `Status : ${I.playerName} move piece`);
            if (moves.length === 1) {
                alertSocket(gameID, "selectionAlert", "Select move automatically because the valid move is unique");
                var { piece, dir } = moves[0];
            } else { var { piece, dir } = await choose(I, "move", moves); }
            board.movePiece(I, piece, dir);
            if (board.checkBaseEnter(I)) { await win(gameID, I.playerName); return; }
            board.color("light", "need");
            show(gameID);
            alertSocket(gameID, "status", `Status : ${I.playerName} select bundle`);
            const bundles = board.findBundles(you);
            if (bundles.length === 1) {
                alertSocket(gameID, "selectionAlert", "Select bundle automatically because the bundle is unique");
                bundle = bundles[0];
            } else { bundle = await choose(I, "bundle", bundles); console.log("qwert", bundle); }
            board.nextTurn();
            alertSocket(gameID, "turnAlert", "New turn");
        }
    }
}

module.exports = { ServerGame };
