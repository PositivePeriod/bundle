export class ClientGameMap {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.makeTable();

        this.cellData = Array.from(Array(this.width), () => new Array(this.height).fill(null));
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                this.cellData[i][j] = { pieceName: null, name: null, status: "noNeed" };
            }
        }

        this.names = ["A", "B"];
        this.statuses = ["noNeed", "light", "need", "choice", "focus"];
        this.pieceDict = new Map();
    }

    makeTable() {
        this.table = document.createElement("table");
        this.table.setAttribute("id", "game-map");
        for (let i = 0; i < this.width; i++) {
            const row = this.table.insertRow(i);
            for (let j = 0; j < this.height; j++) { row.insertCell(j); }
        }
        document.getElementById("playingGameFrame").appendChild(this.table);
    }

    updateCell(pos, data = null) {
        const [x, y] = pos;
        const { pieceName, name, status } = data || this.cellData[x][y];
        const { classList } = this.table.rows[y].cells[x];
        while (classList.length > 0) { classList.remove(classList.item(0)); }
        classList.add(pieceName, name, status);
    }

    updateAll() {
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) { this.updateCell([i, j]); }
        }
    }

    setCellPiece(pos, pieceID) {
        const [x, y] = pos;
        const pieceName = this.pieceDict.get(pieceID);
        this.cellData[x][y].pieceName = pieceName;
    }

    setCellName(pos, name) {
        const [x, y] = pos;
        this.cellData[x][y].name = name;
    }

    setCellStatus(pos, status) {
        const [x, y] = pos;
        this.cellData[x][y].status = status;
    }

    setBundleName(bundle, name) {
        bundle.forEach((pos) => { this.setCellName(pos, name); });
    }

    setBundleStatus(bundle, status) {
        bundle.forEach((pos) => { this.setCellName(pos, status); });
    }

    setAllPiece(pieceArray) {
        pieceArray.forEach(([pos, piece]) => { this.setCellPiece(pos, piece); });
    }
}

export default ClientGameMap;
