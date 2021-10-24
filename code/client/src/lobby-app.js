import ClientGameBoard from "./board.js";
import setColor from "./color.js";

class MultiApp {
    constructor(socket, playerAName, playerBName) {
        this.width = 5;
        this.height = 5;
        this.wait = { type: null };
        this.pos = null;

        this.socket = socket;
        this.board = new ClientGameBoard(this.width, this.height, playerAName, playerBName);

        this.initDOM();
        this.clickOn();
    }

    initDOM() {
        this.table = document.createElement("table");
        this.table.setAttribute("id", "game-map");
        for (let i = 0; i < this.width; i++) {
            const row = this.table.insertRow(i);
            for (let j = 0; j < this.height; j++) { row.insertCell(j); }
        }
        document.getElementById("playingGameFrame").appendChild(this.table);
    }

    update(turn, playerMap, colorMap) {
        this.board.turn = turn;
        document.getElementById("turn").innerText = `Turn : ${turn}`;

        this.board.map = playerMap;
        this.board.colorMap = colorMap;
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                const cell = this.table.rows[j].cells[i];
                cell.innerText = this.board.map[i][j];
                setColor(cell, this.board.colorMap[i][j]);
            }
        }
    }

    show(IColor, youColor) {
        const myName = this.board.I.name;
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                const cell = this.table.rows[j].cells[i];
                cell.innerText = this.board.map[i][j];
                setColor(cell, `${this.board.map[i][j] === myName ? IColor : youColor}-${this.board.map[i][j]}`);
            }
        }
    }

    showBundle(playerName, bundle) {
        bundle.forEach(([x, y]) => {
            const cell = this.table.rows[y].cells[x];
            setColor(cell, `choice-${playerName}`);
        });
    }

    clickOn() { this.table.addEventListener("click", this.handleClick.bind(this)); }

    clickOff() { this.table.removeEventListener("click", this.handleClick.bind(this)); }

    handleClick(event) {
        let x; let y;
        try {
            const td = event.target.closest("td");
            [x, y] = [td.cellIndex, td.parentNode.rowIndex];
            console.log("handleClick", x, y, this.wait.type);
        } catch (error) { if (error instanceof TypeError) { return; } throw error; }
        const compare = (a, b) => JSON.stringify(a) === JSON.stringify(b);
        switch (this.wait.type) {
            case "move":
                if (this.board.map[x][y] === this.board.I.name) {
                    const pieceInBundle = [...this.wait.data]
                        .some((move) => compare(move.from, [x, y]));
                    console.log("move1", this.wait.data, [x, y], pieceInBundle);
                    if (pieceInBundle) {
                        this.pos = [x, y];
                        this.show("need", "noNeed");
                        this.showBundle(this.board.I.name,
                            this.wait.data.map((move) => move.from));
                        setColor(this.table.rows[y].cells[x], `focus-${this.board.I.name}`);
                    }
                } else if (this.board.map[x][y] === null && this.pos) {
                    console.log("move2");
                    const chosenMove = { from: this.pos, to: [x, y] };
                    if (this.wait.data.some((datum) => compare(datum, chosenMove))) {
                        this.wait = { type: null };
                        this.socket.emit("choose", chosenMove);
                    }
                    this.pos = null;
                } break;
            case "bundle":
                if (this.board.map[x][y] === this.board.you.name) {
                    console.log("bundle1");
                    const bundle = this.board.findBundleFromPos([x, y]);
                    this.show("light", "need");
                    this.showBundle(this.board.you.name, bundle);
                    if (JSON.stringify(this.pos) === JSON.stringify([x, y])) {
                        console.log("bundle2");
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
