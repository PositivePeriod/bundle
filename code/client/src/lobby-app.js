import ClientGameBoard from "./board.js";
import { ClientGameMap } from "./clientGameMap.js";

class MultiApp {
    constructor(socket, playerAName, playerBName) {
        this.width = 5;
        this.height = 5;
        this.wait = { type: null };
        this.pos = null;

        this.socket = socket;
        this.board = new ClientGameBoard(this.width, this.height, playerAName, playerBName);

        this.map = new ClientGameMap(this.width, this.height);
        this.map.table.addEventListener("click", this.handleClick.bind(this));
        // this.map.table.removeEventListener("click", this.handleClick.bind(this));
    }

    update(turn, playerMap, colorMap) {
        console.log(playerMap, colorMap);
        this.board.turn = turn;
        document.getElementById("turn").innerText = `Turn : ${turn}`;

        this.board.map = playerMap;
        this.board.colorMap = colorMap;
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                const cell = this.map.table.rows[j].cells[i];
                const name = this.board.map[i][j];
                const status = this.board.colorMap[i][j];
                cell.innerText = name;
                this.map.setCellPiece([i, j], "UpPawn");
                this.setColor([i, j], status, name);
            }
        }
    }

    setColor(pos, status, name) {
        this.map.setCellStatus(pos, status);
        this.map.setCellName(pos, name);
        this.map.updateCell(pos);
    }

    show(IColor, youColor) {
        document.getElementById("turn").innerText = `Turn : ${this.board.turn}`;

        const myName = this.board.I.name;
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                const status = this.board.map[i][j] === myName ? IColor : youColor;
                this.map.setCellStatus([i, j], status);
                this.map.setCellName([i, j], this.board.map[i][j]);
                this.map.updateCell([i, j]);
            }
        }
    }

    showBundle(playerName, bundle) {
        this.map.setBundleName(bundle, playerName);
        this.map.setBundleStatus(bundle, "choice");
        this.map.updateBundle(bundle);
    }

    handleClick(event) {
        let x;
        let y;
        try {
            const td = event.target.closest("td");
            [x, y] = [td.cellIndex, td.parentNode.rowIndex];
        } catch (e) { console.error(e); }
        const compare = (a, b) => JSON.stringify(a) === JSON.stringify(b);
        switch (this.wait.type) {
            case "move":
                if (this.board.map[x][y] === this.board.I.name) {
                    const pieceInBundle = [...this.wait.data]
                        .some((move) => compare(move.from, [x, y]));
                    if (pieceInBundle) {
                        this.pos = [x, y];
                        this.show("need", "noNeed");
                        const bundle = this.wait.data.map((move) => move.from);
                        this.showBundle(this.board.I.name, bundle);
                        this.setColor([x, y], "focus", this.board.I.name);
                    }
                } else if (this.board.map[x][y] === null && this.pos) {
                    const chosenMove = { from: this.pos, to: [x, y] };
                    if (this.wait.data.some((datum) => compare(datum, chosenMove))) {
                        this.wait = { type: null };
                        this.socket.emit("choose", chosenMove);
                    }
                    this.pos = null;
                } break;
            case "bundle":
                if (this.board.map[x][y] === this.board.you.name) {
                    const bundle = this.board.findBundleFromPos([x, y]);
                    this.show("light", "need");
                    this.showBundle(this.board.you.name, bundle);
                    if (JSON.stringify(this.pos) === JSON.stringify([x, y])) {
                        const chosenBundle = bundle;
                        if (this.wait.data.some((datum) => {
                            datum.sort(); chosenBundle.sort();
                            return JSON.stringify(datum) === JSON.stringify(chosenBundle);
                        })) { this.wait = { type: null }; this.socket.emit("choose", chosenBundle); }
                    } else { this.pos = [x, y]; }
                } break;
            case null: break;
            default: console.log("Error", this.wait.type); break;
        }
    }
}

export default MultiApp;
