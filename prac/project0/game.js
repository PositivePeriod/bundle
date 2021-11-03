const { nanoid } = require("nanoid");


class Game {
    constructor() {
        this.io = io;

        this.players = null // Array[object Player] playerIndex
        this.alive = [true] * this.players.length
        this.ended = false;

        this.id = nanoid();
        this.DB = new ServerDB();
    }

    play() {
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

            let move;
            if (moves.length === 1) {
                move = moves[0];
            } else {
                move = await this.choose(I, "move", moves);
            }
            this.board.movePiece(I, move);
            if (this.board.checkBaseEnter(I)) { await this.win(I.name); return; }
            const bundles = this.board.findBundles(you);
            if (bundles.length === 1) {
                bundle = bundles[0];
            } else { bundle = await this.choose(I, "bundle", bundles); }
            this.board.nextTurn();
        }
    }

    turn() {

    }

    loadMap(mapID) {
        this.mapInfo = null // from DB using mapID
        const { version, width, height, playerNumber, pieces } = this.mapInfo;
        if (version !== 1 || playerNumber !== 2) { console.log('Error'); return false }
        this.widht = width;
        this.height = height;
        this.grid = Array.from(Array(this.width), () => new Array(this.height).fill(null));
        for (const piece of pieces) {
            const [playerIndex, pieceID, x, y] = piece.split(' ').map(x => parseInt(x));
            const pieceType = PieceDict.get(pieceID);
            const piece = new pieceType(playerIndex, x, y);
            this.addPiece(x, y, piece);
        }
    }

    nextTurn() {

    }

    addPiece(x, y, piece) {
        this.grid[x][y] = piece;
    }

    findPiece(x, y) {
        return this.grid[x][y]
    }

    movePiece() {

    }

    removePiece() {

    }

    changePiece() {

    }

    findBundle() {

    }

    removeBundle() {

    }

    changeBundle() {

    }

    show() {

    }

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
        if (this.grid[x][y] === null) { return []; }
        const playerIndex = this.grid[x][y].playerIndex
        const bundle = [];
        const visited = Array.from(Array(this.width), () => new Array(this.height).fill(false));
        const stack = [];
        const valid = (i, j) => !visited[i][j] && this.grid[i][j].playerIndex === playerIndex
            && i >= 0 && i <= (this.width - 1) && j >= 0 && j <= (this.height - 1);
        while (stack.length > 0) {
            const [i, j] = stack.pop();
            if (valid(i, j)) {
                visited[i][j] = true;
                bundle.push([i, j]);
                stack.push([i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1],)
            }
        }
        return bundle;
    }
}