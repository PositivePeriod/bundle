const { Pawn, UpPawn, DownPawn, OrthogonalPawn, DiagonalPawn, AllPawn } = require("./pawn.js");

const PieceData = [
    [10, Pawn],
    [11, UpPawn],
    [12, DownPawn],
    [13, OrthogonalPawn],
    [14, DiagonalPawn],
    [15, AllPawn],
];

const IDtoPiece = Object.freeze(new Map(PieceData));

const PieceToID = Object.freeze(new Map(PieceData.map(([id, piece]) => [piece, id])));

module.exports = { IDtoPiece, PieceToID };
