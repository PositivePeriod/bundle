/* eslint-disable no-await-in-loop */
const express = require("express");
const socketio = require("socket.io");
const { nanoid } = require("nanoid");
const path = require("path");
const { ServerGameBoard } = require("./src/board.js");
const { ServerDB } = require("./database/serverDB.js");
const { ServerGame } = require("./src/game.js");

const app = express();
app.use("/", express.static(path.join(__dirname, "../client")));
app.use("/static", express.static(path.join(__dirname, "../static")));
app.get("/", (req, res, next) => { res.redirect("./page"); });

require("dotenv").config();
// 404 처리
const port = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV === "development";
const page = isDev ? `http://localhost:${port}/` : "https://bundle-game.herokuapp.com/";
const server = app.listen(port, () => { console.log(`Bundle : ${page}`); });
const io = socketio(server);

const gameList = new Map();

function alertSocket(gameID, type, msg) { io.to(gameID).emit("sendMSG", { type, msg }); }

const DB = new ServerDB();
const onlineSockets = new Set([]); // Array[socketID]
const publicGameQueue = []; // Array[socketID] waiting for game

const validPlayerName = (name) => typeof name === "string" && name.length >= 3 && name.length <= 20 && /^[0-9a-zA-Z_-]+$/.test(name);
const validPlayerID = (id) => typeof id === "string" && id.length === 21 && /^[0-9a-zA-Z_-]+$/.test(id);
const callbackToSend = (socket, event, callback) => (response) => {
    if (callback) { callback(response); } else { socket.emit(event, response); }
};
const sendTosendError = (send) => (msg) => { console.log("Error", msg); send({ success: false, msg: "Server Problem" }); };

io.on("connect", async (socket) => {
    console.log("Connected Socket : ", socket.id);
    socket.data.registered = false;

    socket.on("register", async (data, callback) => {
        let { type, playerName, playerID } = data;
        // callback 실행시 매우 큰 보안 문제 발생 가능성? ,
        // 같은 채널로 보낸 이후 반대쪽에 socket.once로 받아서 promise 처리하는 것이 더 안전할 것
        const send = callbackToSend(socket, "register", callback);
        const sendError = sendTosendError(send);
        const saveRegisteredInfo = (socket, name, id) => {
            console.log(`Socket Registered as ${name}`);
            socket.data.playerID = id;
            socket.data.playerName = name;
            socket.data.registered = true;
        };

        const validType = typeof type === "string" && ["signIn", "signUp"].includes(type);
        if (!validType) { send({ success: false, msg: "Invalid type" }); return; }
        if (!validPlayerName(playerName)) {
            if (!(playerName.length >= 3 && playerName.length <= 20)) { send({ success: false, msg: "PlayerName length should be 3 ~ 20" }); return; }
            if (!(/^[0-9a-zA-Z_-]+$/.test(playerName))) { send({ success: false, msg: "PlayerName should only contains alphabet, number, _ and -" }); return; }
            send({ success: false, msg: "Invalid playerName" }); return;
        }
        if (socket.data.registered) { send({ success: false, msg: "Already registered socket" }); return; }
        let checkExistence;
        switch (type) {
            case "signIn": {
                if (!validPlayerID(playerID)) { send({ success: false, msg: "Invalid playerName" }); return; }
                checkExistence = await DB.existName(playerName);
                if (!checkExistence.success) { sendError("signIn checkExistence"); return; }
                if (!checkExistence.data) { send({ success: false, msg: "Inexistent playerName" }); return; }

                const { success, data } = await DB.getPlayerByName(playerName);
                if (!success) { sendError("signIn checkValidity"); return; }
                if (data.id !== playerID) { send({ success: false, msg: "Invalid playerID" }); return; }
                const allSockets = await io.sockets.sockets;
                // eslint-disable-next-line no-restricted-syntax
                for (const [socketID, socket] of [...allSockets]) {
                    // console.log(socket.data);
                    if (socket.data.playerName === playerName) {
                        socket.disconnect();
                        if (socket.data.gameID) {
                            console.log("alertSocket disconnected", `Player ${socket.data.playerName} disconnected`);
                            alertSocket(socket.data.gameID, "alert", `Player ${socket.data.playerName} disconnected`);
                            await gameList.get(socket.data.gameID).lose(socket.data.name);
                        }
                        if (publicGameQueue.includes(socket.id)) {
                            const index = publicGameQueue.indexOf(socket.id);
                            if (index !== -1) { publicGameQueue.splice(index, 1); }
                        }
                        onlineSockets.delete(socket.id);
                        console.log("#Server Player : ", onlineSockets.size);
                        io.to("online").emit("sendMSG", { type: "onlinePlayer", msg: onlineSockets.size });
                        // socket.leave('online'); - 이미 disconnect라 나가진 듯
                        // leave all games, 가능한 모든 room에서 나가기
                    }
                }
                saveRegisteredInfo(socket, playerName, playerID);
                send({ success: true, msg: null }); return;
            }
            case "signUp": {
                checkExistence = await DB.existName(playerName);
                if (!checkExistence.success) { sendError("signUp checkExistence"); return; }
                if (checkExistence.data) { send({ success: false, msg: "Existent playerName" }); return; }

                // 실제로는 이메일 등록 안 하고 오래 지나면 지워지는 걸로? -> 등록하도록 안내!
                playerID = nanoid();
                const result = await DB.setPlayer({ playerName, playerID });
                if (!result.success) { sendError("signUp result"); return; }

                saveRegisteredInfo(socket, playerName, playerID);
                send({ success: true, msg: null, playerID }); return;
            }
            default: {
                console.log("Unexpected type not in [signIn, signUp] : ", type);
                send({ success: false, msg: "Invalid type" });
                break;
            }
        }
    });

    socket.on("online", async (callback) => { // not open api? 필요없을지도? - game 하겠다는 의지를 가진 사람으로 한정시켜도 될 듯
        const send = callbackToSend(socket, "online", callback);
        if (!socket.data.registered) { send({ success: false, msg: "Not registered" }); return; }
        if (socket.data.online) { send({ success: false, msg: "Already online" }); return; }
        // eslint-disable-next-line no-param-reassign
        socket.data.online = true;
        send({ success: true, msg: null });
        // make into class function
        onlineSockets.add(socket.id);
        await socket.join("online");
        console.log("Number of Server Player : ", onlineSockets.size);
        io.to("online").emit("sendMSG", { type: "onlinePlayer", msg: onlineSockets.size });
    });

    socket.on("joinPublicGame", async (callback) => {
        const send = callbackToSend(socket, "joinPublicGame", callback);
        if (!socket.data.registered) { send({ success: false, msg: "Not registered" }); return; }
        if (!socket.data.online) { send({ success: false, msg: "Not online" }); return; }
        if (publicGameQueue.includes(socket.id)) { send({ success: true, msg: "Success but already joined" }); return; }
        publicGameQueue.push(socket.id);
        send({ success: true, msg: null });
        console.log(`Join PublicGameQueue : socketID ${socket.data.playerName}`);
        if (publicGameQueue.length >= 2) {
            // 가능하다면 async.queue로 바꾸기
            // 낮은 확률로 3에서 1로 되면서 parallel 문제?, 병렬 문제도... queue 스스로 빼는 것이 나을 듯
            const [socketIDA, socketIDB] = [publicGameQueue.shift(), publicGameQueue.shift()];

            const game = new ServerGame(io, socketIDA, socketIDB);
            gameList.set(game.id, game);
            await game.play();
        }
    });

    socket.on("leavePublicGame", async (callback) => {
        // need to register check? i don't think so
        const send = callbackToSend(socket, "leavePublicGame", callback);
        const index = publicGameQueue.indexOf(socket.id);
        if (index !== -1) {
            publicGameQueue.splice(index, 1);
            send({ success: true, msg: null });
        } else { send({ success: true, msg: "Success but acutally not joined" }); }
    });

    socket.on("playerInfo", async (inputData, callback) => {
        const send = callbackToSend(socket, "playerInfo", callback);
        const sendError = sendTosendError(send);
        const { playerName } = inputData;

        if (!socket.data.registered) { send({ success: false, msg: "No registered" }); return; }
        if (!validPlayerName(playerName)) { send({ success: false, msg: "Invalid playerName" }); return; }
        const { success, data } = await DB.getPlayerByName(playerName);
        if (!success) { sendError("playerInfo"); return; }
        // TODO rename msg -> data
        if (data === null) { send({ success: false, msg: "Inexistent playerName" }); } else {
            // eslint-disable-next-line camelcase
            const { name, win_game, lose_game, join_date, last_date } = data;
            // eslint-disable-next-line max-len
            const playerInfo = { playerName: name, win: win_game, lose: lose_game, join: join_date, last: last_date };
            send({ success: true, msg: playerInfo });
        }
    });

    socket.on("disconnect", async (reason) => {
        console.log(`Socket left : ${socket.data.playerName} : ${reason}`);
        if (socket.data.gameID) {
            console.log("alertSocket disconnected", `Player ${socket.data.playerName} disconnected`);
            alertSocket(socket.data.gameID, "alert", `Player ${socket.data.playerName} disconnected`);
            await gameList.get(socket.data.gameID).lose(socket.data.name);
        }
        if (publicGameQueue.includes(socket.id)) {
            const index = publicGameQueue.indexOf(socket.id);
            if (index !== -1) { publicGameQueue.splice(index, 1); }
        }
        onlineSockets.delete(socket.id);
        console.log("#Server Player : ", onlineSockets.size);
        io.to("online").emit("sendMSG", { type: "onlinePlayer", msg: onlineSockets.size });
        // socket.leave('online'); - 이미 disconnect라 나가진 듯
        // leave all games, 가능한 모든 room에서 나가기
    });
});

// 시간 지나면 ping timeout으로 튕기기는 하는데
// 바로 안 나가지는 경우가 존재!

// V4ORbKpNAAAJ  left because  transport close
// server player# 1
// KaclNCji6IKGQvr7AAAB  left because  ping timeout
// server player# 0
