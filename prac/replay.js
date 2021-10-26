// pre-knowledge

// pieceType -> pieceTypeName
const pieceDict = {
    0: "Block",
    1: "UpPawn",
    2: "DownPawn",
    3: "AllPawn",
    4: "AllPawn",
};

// replay-info
const version = 1;
const mode = 2; // denote timer type, winning position type
const id = "somethingrandomgamid";
const mapWidth = 5;
const mapHeight = 5;
const playerNames = ["Jeuk", "Tom", "Jerry"]; // playerIndex
const rating = [1020, 1500, 980];

// cities, citiarmies, generals, mountains -> initial map
const pieces = [
    [1, 2, 5],
    [2, 2, 5],
    [4, 2, 5],
    [6, 2, 5],
    [7, 2, 5],
];
// info of piece - Array [pieceType, pieceX, pieceY] in pieceIndex

const moves = [[1, 4, 5], [1, 4, 6]];
// turn - pieceIndex, pieceX', pieceY' | bundleCellX, bundleCellY
// 내 턴에 뭐가 죽든 말든 어차피 한 개는 움직임, 안 움직이면 죽은 겨

const time = [10.0123, 1.234, 3.43]; // consumed time for each index

const afk = [[1, 20]]; // playerIndex, turn
const team = [[1, 2], [3]]; // same index -> same team
