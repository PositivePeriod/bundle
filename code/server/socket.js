const socketio = require("socket.io");
const { MSG } = require("../shared/constant");

class SocketManager {
    constructor(server) {
        socketio(server).on(MSG.CONNECT_SERVER, (socket) => {
            socket.on(MSG.JOIN_PLAY, this.joinPlay.bind(this, socket));

            socket.on(MSG.JOIN_PLAY, this.joinPlay.bind(this, socket));

            socket.on(MSG.LEAVE_PLAY, this.leaveGame.bind(this, socket));

            // socket.on(MSG.JOIN_SPECTATE, ); // TODO

            // socket.on(MSG.LEAVE_SPECTATE, ); // TODO

            socket.on(MSG.HANDLE_INPUT, this.handleInput.bind(this, socket));

            // socket.on(MSG.SEND_ANSWER, this.getAnswer.bind(this, socket));

            socket.on(MSG.DISCONNECT_SERVER, this.disconnect.bind(this, socket));
        });
    }

    joinPlay(socket, data) {
        const { AA } = data;

        const { code } = data;

        const playerName = data.name;

        if (AAtoCODE.has(AA) && AAtoCODE.get(AA) === code) {
            console.log(`${socket.id} | Join Room Success`);

            this.game.addPlayer(socket, AA, playerName); // TODO 한 반 당 한 명만
        } else {
            console.log(`${socket.id} | Join Room Failure`);

            socket.emit(MSG.JOIN_PLAY, null);
        }
    }

    leaveGame() {
        this.game.removePlayer(socket);
    }

    handleInput(socket, command) {
        // console.log(`${socket.id} | Handle Input`);

        if (this.game.players.has(socket.id)) {
            this.game.players.get(socket.id).commandQueue.push(command);
        }
    }

    disconnect(socket) {
        console.log(`${socket.id} | Disconnect`);

        this.game.removePlayer(socket.id);
    }
}

module.exports = SocketManager;
