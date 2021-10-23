const { range } = require("../../shared/util.js");
const { UpPawn, DownPawn } = require("../game/piece/pawn.js");

class ServerGameBoard {
    constructor(width, height, socketA, socketB) {
        this.width = width;
        this.height = height;

        this.turn = 1;
        this.players = [
            { name: "A", dirs: [[1, 0], [-1, 0], [0, 1]], pieces: this.width, socket: socketA, playerName: socketA.data.playerName, state: null },
            { name: "B", dirs: [[1, 0], [-1, 0], [0, -1]], pieces: this.width, socket: socketB, playerName: socketB.data.playerName, state: null },
        ];
        this.map = Array.from(Array(this.width), () => new Array(this.height).fill(null));
        this.colorMap = Array.from(Array(this.width), () => new Array(this.height).fill(null));
        // left bottom (0,0), right bottom(width-1,0)
        // left top (0,height-1), right top(width-1,height-1)
        for (let i = 0; i < this.width; i++) {
            this.map[i][0] = "A";
            this.map[i][this.height - 1] = "B";
            // this.map[i][0] = new UpPawn(this.players[0], i, 0);
            // this.map[i][this.height - 1] = new DownPawn(this.players[1], i, 0);
        }
        this.ended = false;
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

    win(playerName) {
        const winner = this.players.find((player) => player.playerName === playerName);
        winner.state = true;
        return this.currentState();
    }

    lose(playerName) {
        const loser = this.players.find((player) => player.playerName === playerName);
        loser.state = false;
        return this.currentState();
    }

    end() {
        this.ended = true;
    }

    color(IColor, youColor) {
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                this.colorMap[i][j] = `${this.map[i][j] === this.I.name ? IColor : youColor}-${this.map[i][j]}`;
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
                if (this.map[i][j] === player.name) { pieces.push([i, j]); }
            }
        }
        return pieces;
    }

    findBundleFromPos(pos) {
        const [x, y] = pos;
        if (this.map[x][y] === null) { return []; }
        const visited = Array.from(Array(this.width), () => new Array(this.height).fill(false));
        const bundle = [];
        this.DFS(x, y, visited, this.map[x][y], bundle);
        return bundle;
    }

    DFS(i, j, visited, playerName, group) {
        if (i >= 0 && i <= (this.width - 1) && j >= 0 && j <= (this.height - 1)) {
            if (!visited[i][j] && this.map[i][j] === playerName) {
                // eslint-disable-next-line no-param-reassign
                visited[i][j] = true;
                group.push([i, j]);
                this.DFS(i + 1, j, visited, playerName, group);
                this.DFS(i - 1, j, visited, playerName, group);
                this.DFS(i, j + 1, visited, playerName, group);
                this.DFS(i, j - 1, visited, playerName, group);
            }
        }
    }

    findBundleMove(player, bundle) {
        const validMove = (x, y) => this.checkRange(x, y) && this.map[x][y] === null;
        const moves = [];
        bundle.forEach(([x, y]) => {
            player.dirs.forEach(([dx, dy]) => {
                if (validMove(x + dx, y + dy)) { moves.push({ piece: [x, y], dir: [dx, dy] }); }
            });
        });
        // const move = null;
        // moves.push(...move)
        return moves;
    }

    movePiece(player, piece, dir) {
        const validFrom = (x, y) => this.checkRange(x, y) && this.map[x][y] === player.name;
        const validTo = (x, y) => this.checkRange(x, y) && this.map[x][y] === null;
        const [x, y] = piece;
        const [dx, dy] = dir;
        if (validFrom(x, y) && validTo(x + dx, y + dy)) {
            this.map[x][y] = null;
            this.map[x + dx][y + dy] = player.name;
        }
    }

    deleteBundle(player, bundle) {
        bundle.forEach((piece) => { this.deletePiece(player, piece); });
    }

    deletePiece(player, piece) {
        const [x, y] = piece;
        this.map[x][y] = null;
        player.pieces--;
    }

    checkRange(i, j) { return i >= 0 && i <= (this.width - 1) && j >= 0 && j <= (this.height - 1); }

    checkNoPiece(player) { return player.pieces === 0; }

    checkBaseEnter(player) {
        const y = player.name === "B" ? 0 : this.height - 1;
        return range(this.width).some((i) => this.map[i][y] === player.name);
    }
}

module.exports = { ServerGameBoard };
