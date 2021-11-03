"use strict";
var Player = require('./player').Player;
var _a = require('./piece'), Piece = _a.Piece, PieceImpl = _a.PieceImpl;
var ServerGameBoard = /** @class */ (function () {
    function ServerGameBoard(map, width, height, players) {
        this.map = map;
        this.width = width;
        this.height = height;
        this.players = players;
        this.turn = 0;
        this.ended = false;
    }
    ServerGameBoard.prototype.I = function () {
        return this.players[this.turn % this.players.length];
    };
    ServerGameBoard.prototype.you = function () {
        return this.players[(this.turn + 1) % this.players.length];
    };
    ServerGameBoard.prototype.setPiece = function (pos, piece) {
        this.map[pos] = piece;
    };
    ServerGameBoard.prototype.getPiece = function (pos) {
        return this.map[pos];
    };
    ServerGameBoard.prototype.movePiece = function (fromPos, toPos) {
        this.map[toPos] = this.map[fromPos];
    };
    ServerGameBoard.prototype.isLegalMove = function (fromPos, toPos, bundlePos) {
        var validMovePiece = this.getPiece(fromPos) && this.getPiece(fromPos).player === this.I() && !this.getPiece(toPos);
        var validSelectBundle = this.getPiece(bundlePos) && this.getPiece(bundlePos) === this.you();
        return validMovePiece && validSelectBundle;
    };
    ServerGameBoard.prototype.play = function () {
        var bundle = this.board.findBundles(this.board.I)[0];
        while (!this.board.ended) {
            var _a = [this.board.I, this.board.you], I = _a[0], you = _a[1];
            var moves = this.board.findBundleMove(I, bundle); // already chosen bundle
            if (moves.length === 0) {
                console.log(bundle);
                this.board.deleteBundle(I, bundle);
                if (this.board.checkNoPiece(I)) {
                    yield this.win(you.name);
                    return;
                }
                bundle = this.board.findPieces(I); // use all pieces as bundle in pieces
                moves = this.board.findBundleMove(I, bundle);
                if (moves.length === 0) {
                    yield this.win(you.name);
                    return;
                }
            }
            var move = void 0;
            if (moves.length === 1) {
                move = moves[0];
            }
            else {
                move = yield this.choose(I, "move", moves);
            }
            this.board.movePiece(I, move);
            if (this.board.checkBaseEnter(I)) {
                yield this.win(I.name);
                return;
            }
            var bundles = this.board.findBundles(you);
            if (bundles.length === 1) {
                bundle = bundles[0];
            }
            else {
                bundle = yield this.choose(I, "bundle", bundles);
            }
            this.board.nextTurn();
        }
    };
    return ServerGameBoard;
}());
module.exports = { ServerGameBoard: ServerGameBoard };
