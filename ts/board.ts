const { Player } = require('./player')
const { Piece, PieceImpl } = require('./piece')

type GameMap = (Piece | undefined)[]
type Bundle = number[];

interface ServerGameBoard {
    map: GameMap,
    width: number,
    height: number,
    players: typeof Player[],
    turn: number,
    ended: boolean,
    bundle: Bundle
    I(): typeof Player,
    You(): typeof Player,
    setPiece(pos: number, piece: Piece): void,
    getPiece(pos: number):  Piece | undefined,
    movePiece(fromPos: number, toPos: number): void,
    isLegalMove(fromPos: number, toPos: number, bundlePos: number): boolean,
    findBundle(pos: number): Bundle,
    checkNoPiece(player: typeof Player): boolean,
    checkFinish(): void,
    end(): void,
    toString(): string,
}



class ServerGameBoard implements ServerGameBoard {
    constructor(map: GameMap, width: number, height: number, players: typeof Player[]) {
        this.map = map;
        this.width = width;
        this.height = height;
        this.players = players;

        this.turn = 0;
        this.ended = false;
        this.bundle;
    }

    I() {
        return this.players[this.turn % this.players.length];
    }

    you() {
        return this.players[(this.turn + 1) % this.players.length];
    }

    setPiece(pos: number, piece: typeof Piece) {
        this.map[pos] = piece;
    }

    getPiece(pos: number) {
        return this.map[pos]
    }

    movePiece(fromPos: number, toPos: number) {
        this.map[toPos] = this.map[fromPos];
    }

    isLegalMove(fromPos: number, toPos: number, bundlePos: number) {
        const validMovePiece = this.getPiece(fromPos) && this.getPiece(fromPos).player === this.I() && !this.getPiece(toPos)
        const validSelectBundle = this.getPiece(bundlePos) && this.getPiece(bundlePos) === this.you()
        return validMovePiece && validSelectBundle
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

    getPiece
}

module.exports = { ServerGameBoard };
