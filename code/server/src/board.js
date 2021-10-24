const { range, Array2D } = require("../../shared/util.js");
const { NullPiece } = require("../game/piece/nullPiece.js");
const { UpPawn, DownPawn } = require("../game/piece/pawn.js");

class ServerGameBoard {
    constructor(width, height, socketA, socketB) {
        this.width = width;
        this.height = height;

        this.turn = 1;
        this.players = [
            {
                name: "A",
                dirs: [[1, 0], [-1, 0], [0, 1]],
                pieces: this.width,
                socket: socketA,
                playerName: socketA.data.playerName,
                state: null,
            },
            {
                name: "B",
                dirs: [[1, 0], [-1, 0], [0, -1]],
                pieces: this.width,
                socket: socketB,
                playerName: socketB.data.playerName,
                state: null,
            },
        ];
        this.nameToPlayerName = new Map(
            this.players.map((player) => [player.name, player.playerName]),
        );
        this.nameToPlayerName.set(null, null);

        this.players.forEach((player) => { player.socket.data.name = player.name; });
        this.map = Array2D(this.width, this.height,
            ((Piece) => new Piece()).bind(null, NullPiece));
        this.colorMap = Array2D(this.width, this.height);
        // left bottom (0,0), right bottom(width-1,0)
        // left top (0,height-1), right top(width-1,height-1)

        for (let i = 0; i < this.width; i++) {
            this.map[i][0] = new UpPawn("A", i, 0);
            this.map[i][this.height - 1] = new DownPawn("B", i, this.height - 1);
        }
        this.ended = false;
    }

    show() {
        return {
            turn: this.turn,
            playerMap: this.map.map(
                (row) => row.map((cell) => cell.name),
            ),
            colorMap: this.colorMap,
        };
    }

    currentState() {
        const unknown = this.players.filter((player) => player.state === null);
        const winner = this.players.filter((player) => player.state === true);
        const loser = this.players.filter((player) => player.state === false);
        return {
            unknownNames: unknown.map((player) => player.playerName),
            winnerNames: winner.map((player) => player.playerName),
            loserNames: loser.map((player) => player.playerName),
        };
    }

    win(name) {
        const winner = this.players.find((player) => player.name === name);
        winner.state = true;
        return this.currentState();
    }

    lose(name) {
        const loser = this.players.find((player) => player.name === name);
        loser.state = false;
        return this.currentState();
    }

    end() {
        this.ended = true;
    }

    color(IColor, youColor) {
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                this.colorMap[i][j] = `${this.map[i][j].name === this.I.name ? IColor : youColor}-${this.map[i][j].name}`;
            }
        }
    }

    colorBundle(playerName, bundle) {
        bundle.forEach(([x, y]) => { this.colorMap[x][y] = `choice-${playerName}`; });
    }

    nextTurn() { this.turn++; }

    get I() { return this.players[this.turn % this.players.length]; }

    get you() { return this.players[(this.turn + 1) % this.players.length]; }

    findBundles(player) {
        const visited = Array.from(Array(this.width), () => new Array(this.height).fill(false));
        const bundles = [];
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                const bundle = [];
                this.DFS(i, j, visited, player.name, bundle);
                if (bundle.length > 0) { bundles.push(bundle); }
            }
        }
        return bundles;
    }

    findPieces(player) {
        const pieces = [];
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                if (this.map[i][j].name === player.name) { pieces.push([i, j]); }
            }
        }
        return pieces;
    }

    findBundleFromPos(pos) {
        const [x, y] = pos;
        if (this.map[x][y] === null) { return []; }
        const visited = Array.from(Array(this.width), () => new Array(this.height).fill(false));
        const bundle = [];
        this.DFS(x, y, visited, this.map[x][y].name, bundle);
        return bundle;
    }

    DFS(i, j, visited, name, group) {
        if (i >= 0 && i <= (this.width - 1) && j >= 0 && j <= (this.height - 1)) {
            if (!visited[i][j] && this.map[i][j]?.name === name) {
                // eslint-disable-next-line no-param-reassign
                visited[i][j] = true;
                group.push([i, j]);
                this.DFS(i + 1, j, visited, name, group);
                this.DFS(i - 1, j, visited, name, group);
                this.DFS(i, j + 1, visited, name, group);
                this.DFS(i, j - 1, visited, name, group);
            }
        }
    }

    findBundleMove(player, bundle) {
        const validMove = (move) => {
            // const [x, y] = move.to; // need to check from?
            const [x, y] = move.to;
            return this.checkRange(x, y) && this.map[x][y] instanceof NullPiece;
        };
        return bundle.map(([x, y]) => this.map[x][y].move())
            .reduce((accumulator, currentValue) => accumulator.concat(currentValue), [])
            .filter(validMove);
    }

    movePiece(player, move) {
        // const validFrom = (x, y) => this.checkRange(x, y) && this.map[x][y].name === player.name;
        // const validTo = (x, y) => this.checkRange(x, y) && this.map[x][y] instanceof NullPiece;

        const [x1, y1] = move.from; const [x2, y2] = move.to;
        this.map[x2][y2] = this.map[x1][y1];
        this.map[x2][y2].pos = move.to;
        this.map[x1][y1] = new NullPiece(x1, y1);
    }

    deleteBundle(player, bundle) {
        bundle.forEach((pos) => { this.deletePiece(player, pos); });
    }

    deletePiece(player, pos) {
        console.log("delete piece", pos);
        const [x, y] = pos;
        this.map[x][y] = new NullPiece(x, y);
        player.pieces--;
    }

    checkRange(i, j) { return i >= 0 && i <= (this.width - 1) && j >= 0 && j <= (this.height - 1); }

    checkNoPiece(player) { return player.pieces === 0; }

    checkBaseEnter(player) {
        const y = player.name === "B" ? 0 : this.height - 1;
        return range(this.width).some((i) => this.map[i][y]?.name === player.name);
    }
}

module.exports = { ServerGameBoard };
