const express = require("express");
const socketio = require("socket.io");
const { nanoid } = require("nanoid");
const path = require("path")
const { ServerGame } = require("./game/game.js");
const { ServerGameBoard } = require("./src/board.js");
const { ServerDB } = require("./database/serverdb.js");
const { Validator } = require("./validator.js");
const { AsyncSet } = require("./asyncObject/asyncSet.js");
const { AsyncQueue } = require("./asyncObject/asyncQueue.js");

require("dotenv").config();

class Server {
    constructor() {
        this.app = express();
        const clientPath = path.join(__dirname, "../client");
        const staticPath = path.join(__dirname, "../static");
        this.app.use("/", express.static(clientPath));
        this.app.use("/static", express.static(staticPath));
        this.app.get("/", (req, res, next) => { res.redirect("./page"); });

        const isDev = process.env.NODE_ENV === "development";
        const port = process.env.PORT || 5000;
        const page = isDev ? `http://localhost:${port}/` : "https://bundle-game.herokuapp.com/";
        const server = this.app.listen(port, () => { console.log(`Playing Bundle on ${page}`); });
        this.io = socketio(server);

        this.isValid = new Validator();

        this.DB = new ServerDB();
        this.onlineSockets = new Set(); // Array[socketID]
        this.publicGameQueue = [];    // Array[socketID] waiting for game

        const gameList = new Map();

        function alertSocket(gameID, type, msg) { io.to(gameID).emit("sendMSG", { type, msg }); }
        const sendTosendError = (send) => (msg) => { console.log("Error", msg); send({ success: false, msg: "Server Problem" }); };

        this.bind();
    }

    bind() {
        this.io.on("connect", async (socket) => {
            console.log("Connected Socket : ", socket.id);
            socket.data.registered = false;

            const bindList = [
                "signIn",
                "signUp",
                "online",
                "joinPublicGame",
                "joinPublicGame",
                "leavePublicGame",
                "playerInfo",
                "disconnect"
            ];
            const sendEvent = (sock, event) => (data) => { sock.emit(event, data); };
            bindList.forEach(name => { socket.on(name, this[name].bind(null, socket)); });
        });
    }

    async signIn(data, socket) {
        const sendData = (data) => { socket.emit('signIn', { success: data === null, "data": data }); }
        const sendError = (data) => { sendData(data); console.log(data); }

        const { playerID } = data;
        const invalidPlayerID = this.isValid.playerID(playerID);
        if (invalidPlayerID) { sendData(invalidPlayerID); return; }

        const { success, player } = await DB.getPlayerByID(playerID); // DB 측 최적화 필요
        if (!success) { sendError("Errno : #101"); return; }

        const updatePlayer = await DB.updatePlayerByName({ playerName: player.name, key: "date" }); // DB 측 최적화 필요
        if (!updatePlayer.success) { sendError("Errno : #102"); return; }

        // socket.data.playerID = player.id; // for security problem
        socket.data.playerName = player.name;
        socket.data.registered = true;
        console.log(`SignIn | Socket ${socket.id} PlayerName ${player.name}`);
        sendData(null);
    }

    async signUp(data, socket) {
        const sendData = (data) => { socket.emit('signUp', { success: data === null, "data": data }); }
        const sendError = (data) => { sendData(data); console.log(data); }

        const { playerName } = data;
        const invalidPlayerName = this.isValid.playerName(playerName);
        if (invalidPlayerName) { sendData(invalidPlayerName); return; }

        const existsName = await DB.existName(playerName);
        if (!existsName.success) { sendError("Errno : #201"); return; }
        if (existsName.data) { send({ success: false, data: "Existent playerName" }); return; }

        // TODO - Add email register
        const playerID = nanoid();
        const setPlayer = await DB.setPlayer({ playerName, playerID });
        if (!setPlayer.success) { sendError("Errno : #202"); return; }
        console.log(`SignUp | Socket ${socket.id} PlayerName ${playerName}`);
        socket.emit('signUp', { success: true, "data": playerID });
    }

    async online(type, socket) {
        if (!socket.data.registered) { return { success: false, data: "Not registered" } }
        if (socket.data.online) { return { success: false, data: "Already online" }; }

        switch (type) {
            case "join":
                socket.data.online = true;
                await socket.join("online");
                await this.onlineSockets.add(socket.id);
                break;
            case "leave":
                socket.data.online = false;
                // await socket.leave("online"); // auto?
                await this.onlineSockets.delete(socket.id);
                break;
            default:
                break;
        }
        console.log(`#Online Player | ${await this.onlineSockets.size()}`);
        // change into sendDATA
        io.to("online").emit("sendMSG", { type: "onlinePlayer", data: await this.onlineSockets.size() });
    }

    async joinPublicGame() {
        const q = async.queue((task, callback) => {
            console.log(`hello ${task.name}`);
            callback();
        }, 2);

        const sendData = (data) => { socket.emit('joinPublicGame', { success: data === null, "data": data }); }
        const sendError = (data) => { sendData(data); console.log(data); }

        if (!socket.data.registered) { sendData("Not registered"); }
        if (!socket.data.online) { sendData("Not online"); }
        if (await this.publicGameQueue.includes(socket.id)) { sendData("Success but already joined"); return; }
        await this.publicGameQueue.push(socket.id);
        sendData(null);

        console.log(`Join Public Game | PlayerName ${socket.data.playerName}`);

        // Error danger
        const [socketIDA, socketIDB] = [await this.publicGameQueue.shift(), await this.publicGameQueue.shift()];
        if (socketIDA === undefined) { if (socketIDB !== undefined) { await this.publicGameQueue.unshift(socketIDB); } return }
        if (socketIDB === undefined) { if (socketIDA !== undefined) { await this.publicGameQueue.unshift(socketIDA); } return }

        const gameID = nanoid();
        const socketA = await io.sockets.sockets.get(socketIDA);
        const socketB = await io.sockets.sockets.get(socketIDB);
        socketA.join(gameID); socketA.data.gameID = gameID;
        socketB.join(gameID); socketB.data.gameID = gameID;
        console.log(`Game Start | Game ${gameID} between PlayerName ${socketA.data.playerName}, ${socketB.data.playerName}`);
        io.to(gameID).emit("startGame", { id: gameID, players: [socketA.data.playerName, socketB.data.playerName] });
        new ServerGame()
        await play(gameID, socketA, socketB);

        // if (publicGameQueue.length >= 2) {
        //     // 가능하다면 async.queue로 바꾸기
        //     // 낮은 확률로 3에서 1로 되면서 parallel 문제?, 병렬 문제도... queue 스스로 빼는 것이 나을 듯
        //     const [socketIDA, socketIDB] = [publicGameQueue.shift(), publicGameQueue.shift()];

        //     const game = new ServerGame(io, socketIDA, socketIDB);
        //     gameList.set(game.id, game);
        //     await game.play();
        // }
    }

    async leavePublicGame() {
        const sendData = (data) => { socket.emit('leavePublicGame', { success: data === null, "data": data }); }
        await publicGameQueue.remove(socket.id);
        sendData(null);
    }

    async playerInfo(data) {
        const send = callbackToSend(socket, "playerInfo", callback);
        const sendError = sendTosendError(send);
        const { playerName } = inputData;

        if (!socket.data.registered) { send({ success: false, data: "No registered" }); return; }
        if (!validPlayerName(playerName)) { send({ success: false, data: "Invalid playerName" }); return; }
        const { success, data } = await DB.getPlayerByName(playerName);
        if (!success) { sendError("playerInfo"); return; }
        // TODO rename data -> data
        if (data === null) { send({ success: false, data: "Inexistent playerName" }); } else {
            // eslint-disable-next-line camelcase
            const { name, win_game, lose_game, join_date, last_date } = data;
            // eslint-disable-next-line max-len
            const playerInfo = { playerName: name, win: win_game, lose: lose_game, join: join_date, last: last_date };
            send({ success: true, data: playerInfo });
        }
    }

    async disconnect() {

        console.log(`Socket left : ${socket.data.playerName} : ${reason}`);
        if (socket.data.gameID) {
            console.log("alertSocket disconnected", `Player ${socket.data.playerName} disconnected`);
            alertSocket(socket.data.gameID, "alert", `Player ${socket.data.playerName} disconnected`);
            await lose(vsocket.data.playerName);
        }
        if (publicGameQueue.includes(socket.id)) {
            const index = publicGameQueue.indexOf(socket.id);
            if (index !== -1) { publicGameQueue.splice(index, 1); }
        }
        this.online('leave', socket);
        socket.data.registered = false;
        // socket.leave('online'); - 이미 disconnect라 나가진 듯
        // leave all games, 가능한 모든 room에서 나가기
    }
}

module.exports = { Server };
