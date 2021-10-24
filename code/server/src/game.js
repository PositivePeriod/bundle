const { nanoid } = require("nanoid");
const { ServerDB } = require("../database/serverDB.js");
const { ServerGameBoard } = require("./board.js");

class ServerGame {
    constructor(io, socketIDA, socketIDB) {
        this.io = io;
        this.sockets = [
            this.io.sockets.sockets.get(socketIDA),
            this.io.sockets.sockets.get(socketIDB),
        ];

        this.id = nanoid();
        this.sockets.forEach((socket) => {
            socket.join(this.id);
            // eslint-disable-next-line no-param-reassign
            socket.data.gameID = this.id;
        });
        console.log(`Game ${this.id} Start : ${this.sockets[0].data.playerName} ${this.sockets[1].data.playerName}`);
        this.io.to(this.id).emit("startGame", { id: this.id, players: [this.sockets[0].data.playerName, this.sockets[1].data.playerName] });

        this.width = 5;
        this.height = 5;
        this.board = new ServerGameBoard(this.width, this.height, this.sockets[0], this.sockets[1]);
        this.DB = new ServerDB();
    }

    async play() {
        const alertSocket = function aS(gameID, type, msg) { this.io.to(gameID).emit("sendMSG", { type, msg }); }.bind(this);
        let bundle = this.board.findBundles(this.board.I)[0];
        while (!this.board.ended) {
            const [I, you] = [this.board.I, this.board.you];
            let moves = this.board.findBundleMove(I, bundle); // already chosen bundle
            if (moves.length === 0) {
                console.log(bundle);
                this.board.deleteBundle(I, bundle);
                if (this.board.checkNoPiece(I)) { await this.win(you.name); return; }
                bundle = this.board.findPieces(I); // use all pieces as bundle in pieces
                moves = this.board.findBundleMove(I, bundle);
                if (moves.length === 0) { await this.win(you.name); return; }
            }
            this.board.color("need", "noNeed");
            this.board.colorBundle(I.name, bundle);
            this.show(this.id);
            alertSocket(this.id, "status", `Status : ${I.playerName} move piece`);

            let move;
            if (moves.length === 1) {
                alertSocket(this.id, "selectionAlert", "Select move automatically because the valid move is unique");
                move = moves[0];
            } else {
                move = await this.choose(I, "move", moves);
            }
            this.board.movePiece(I, move);
            if (this.board.checkBaseEnter(I)) { await this.win(I.name); return; }
            this.board.color("light", "need");
            this.show(this.id);
            alertSocket(this.id, "status", `Status : ${I.playerName} select bundle`);
            const bundles = this.board.findBundles(you);
            if (bundles.length === 1) {
                alertSocket(this.id, "selectionAlert", "Select bundle automatically because the bundle is unique");
                bundle = bundles[0];
            } else { bundle = await this.choose(I, "bundle", bundles); }
            this.board.nextTurn();
            alertSocket(this.id, "turnAlert", "New turn");
        }
    }

    show(gameID) {
        if (!this.board.ended) {
            this.io.to(gameID).emit("updateGame", this.board.show());
        }
    }

    async win(name) {
        const { unknownNames, winnerNames, loserNames } = this.board.win(name);
        await this.finishGame(winnerNames, [...unknownNames, ...loserNames]); // only for 1vs1
    }

    async lose(name) {
        const { unknownNames, winnerNames, loserNames } = this.board.lose(name);
        await this.finishGame([...unknownNames, ...winnerNames], [...loserNames]); // only for 1vs1}
    }

    async finishGame(winnerNames, loserNames) {
        this.board.color("need", "need"); this.show(this.id);
        this.io.to(this.id).emit("sendMSG", {
            type: "win",
            msg: `${winnerNames} win ${loserNames} lose`,
            data: { winnerNames, loserNames },
        });
        console.log(`Game ${this.id} finish : ${winnerNames} win, ${loserNames} lose`);
        // eslint-disable-next-line no-param-reassign
        this.board.players.forEach((player) => { player.socket.data.gameID = null; });
        winnerNames.forEach(async (winnerName) => {
            const { success } = await this.DB.updatePlayerByName({ key: "win", playerName: winnerName });
            if (!success) { console.log("could not save, server problem"); }
        });
        loserNames.forEach(async (loserName) => {
            const { success } = await this.DB.updatePlayerByName({ key: "lose", playerName: loserName });
            if (!success) { console.log("could not save, server problem"); }
        });
        this.io.socketsLeave(this.id);
    }

    // eslint-disable-next-line class-methods-use-this
    async choose(player, type, possibleData) {
        let resolveFunc = null;
        const result = new Promise((resolve) => { resolveFunc = resolve; });
        player.socket.once("choose", (chosenDatum) => {
            // 순환 불가능한 거나 주거나 양식 안 맞는 거 줘서 서버 터질 수도...
            switch (type) {
                case "move":
                    if (possibleData.some(
                        (datum) => JSON.stringify(datum) === JSON.stringify(chosenDatum),
                    )) { resolveFunc(chosenDatum); }
                    break;
                case "bundle":
                    if (possibleData.some((datum) => {
                        datum.sort(); chosenDatum.sort();
                        return JSON.stringify(datum) === JSON.stringify(chosenDatum);
                    })) { resolveFunc(chosenDatum); }
                    break;
                default:
                    break;
            }
            resolveFunc(chosenDatum[Math.floor(Math.random() * chosenDatum.length)]);
        });
        player.socket.emit("choose", { type, data: possibleData });
        console.log("result", await result);
        return result;
    }
}

module.exports = { ServerGame };
