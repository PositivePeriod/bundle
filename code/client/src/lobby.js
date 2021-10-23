import MultiApp from "./lobby-app.js";
import LocalApp from "./local-app.js";
import { loadStorage, saveStorage, backupStorage } from "./clientDB.js";

window.onload = main;
const updateLog = (msg) => { const logElem = document.getElementById("log"); logElem.innerText += `\n${msg}`; logElem.scrollTop = logElem.scrollHeight; };

async function main() {
    // set language
    let playerLang = "en";
    const languageList = ["ko", "en"];
    languageList.forEach((lang) => { if (navigator.language.includes(lang)) { playerLang = lang; } });
    document.getElementById("ruleA").href = `./page/rule/${playerLang}.html`;
    // ---- makeRequest(`./page/rule/${language}.html`)

    let localApp;
    document.getElementById("joinLocal").onclick = () => {
        document.getElementById("players").innerText = "A vs B";
        document.getElementById("lobbyFrame").hidden = true;
        document.getElementById("playingGameFrame").hidden = false;
        document.getElementById("publicFrame").hidden = true;
        document.getElementById("onlineGameFrame").hidden = false;
        localApp = new LocalApp();
    };

    // Connection
    const socketProtocol = (window.location.protocol.includes("https")) ? "wss" : "ws";
    const socket = io(`${socketProtocol}://${window.location.host}`); socket.data = {};
    socket.on("connect", () => {
        // updateLog('Connect Server connection as ' + socket.id);
    });
    socket.registered = false;

    // AutoRegistration
    const success = await autoRegister(socket);
    if (success === null) { // server error
        alert("Server Problem - autoregister failed");
    } else if (success === false) {
        document.getElementById("wait").hidden = true;
        document.getElementById("registerFrame").hidden = false;
        document.getElementById("signup").onclick = manualRegister.bind(null, socket);
    }
}

async function afterRegister(socket) {
    socket.on("sendMSG", async (data) => {
        switch (data.type) {
            case "status":
                document.getElementById("status").innerText = data.msg; break;
            case "win":
                document.getElementById("status").innerText = data.msg;
                document.getElementById("backToLobby").onclick = () => {
                    document.getElementById("endGameFrame").hidden = true;
                    document.getElementById("game-map").remove();
                    document.getElementById("playingGameFrame").hidden = true;
                    document.getElementById("lobbyFrame").hidden = false;
                };
                document.getElementById("endGameFrame").hidden = false;
                var { success, msg } = await response(socket, "playerInfo", { playerName: socket.data.playerName });
                if (!success) { console.log("Server problem : get info fail", msg); return null; }
                var { win, lose, join, last } = msg;
                document.getElementById("statistics").innerText = `Win / Lose / Ratio : ${win} / ${lose} / ${win + lose === 0 ? 0 : win / (win + lose)}`;
                break;
            case "turnAlert":
                if (document.getElementById("turnAlert").checked) { alert(data.msg); } break;
            case "selectionAlert":
                if (document.getElementById("uniqueAlert").checked) { alert(data.msg); } break;
            case "onlinePlayer":
                document.getElementById("onlinePlayer").innerText = `Online : ${data.msg}`; break;
            default:
                console.log("Unexpected MSG : ", data); break;
        }
    });

    // Get info
    var { success, msg } = await response(socket, "online");
    if (!success) { console.log("Server problem : online fail", msg); return null; }
    var { success, msg } = await response(socket, "playerInfo", { playerName: socket.data.playerName });
    if (!success) { console.log("Server problem : get info fail", msg); return null; }
    const { win, lose, join, last } = msg;
    document.getElementById("name").innerText = `Player : ${socket.data.playerName}`;
    document.getElementById("statistics").innerText = `Win / Lose / Ratio : ${win} / ${lose} / ${win + lose === 0 ? 0 : win / (win + lose)}`;

    // Change visibility of DOM element -> Update view
    document.getElementById("wait").hidden = true;
    document.getElementById("registerFrame").hidden = true;
    document.getElementById("infoFrame").hidden = false;
    document.getElementById("onlineGameFrame").hidden = false;

    document.getElementById("joinPublic").addEventListener("click", async () => {
        const { success, msg } = await response(socket, "joinPublicGame");
        if (success) {
            updateLog("Joining public game");
            document.getElementById("onlineGameFrame").hidden = true;
            document.getElementById("publicFrame").hidden = false;
        } else { console.log(msg); }
    });

    document.getElementById("leavePublic").addEventListener("click", async () => {
        socket.emit("leavePublicGame");
        updateLog("Leaving public game");
        document.getElementById("publicFrame").hidden = true;
        document.getElementById("onlineGameFrame").hidden = false;
    });

    document.getElementById("joinCustom").addEventListener("click", () => {
        alert("Coming soon...");
        // var gameID = window.prompt('Write custom game code');
        // if (gameID !== null) { window.location = `./game/${gameID}`; }
    });

    document.getElementById("makeCustom").addEventListener("click", async () => {
        alert("Coming soon...");
        // var { success, msg, gameID } = await response(socket, "customGame");
        // if (success) { updateLog('Waiting PVP game'); }
        // else { console.log(msg); }
    });

    let multiApp;
    socket.on("startGame", (data) => {
        const { id, players } = data;
        const [playerAName, playerBName] = players;
        updateLog(`Game id ${id} starts! between ${players}`);
        document.getElementById("players").innerText = `${playerAName} vs ${playerBName}`;
        document.getElementById("lobbyFrame").hidden = true;
        document.getElementById("playingGameFrame").hidden = false;
        document.getElementById("publicFrame").hidden = true;
        document.getElementById("onlineGameFrame").hidden = false;
        multiApp = new MultiApp(socket, playerAName, playerBName);
    });

    socket.on("updateGame", (data) => { const { turn, playerMap, colorMap } = data; multiApp.update(turn, playerMap, colorMap); });
    socket.on("choose", (data) => { multiApp.wait = data; });
    socket.on("disconnect", () => {
        alert("Disconnected since same account is used");
        updateLog(`disconnected\n${"-".repeat(50)}`);
        document.body.innerHTML = "";
    });
}

async function autoRegister(socket) {
    const { playerID, playerName } = loadStorage();
    if (playerID === null) { return false; }
    const { success, msg } = await response(socket, "register", { type: "signIn", playerName, playerID });
    if (!success) { console.log("Fail register", msg); return false; }
    socket.registered = true; socket.data.playerID = playerID; socket.data.playerName = playerName;
    console.log(`PlayerName : ${playerName}\nplayerID : ${playerID}\nDo not share playerID\nOther people can use it to impersonate you`);
    await afterRegister(socket);
    return true;
}

async function manualRegister(socket) {
    while (true) {
        const newPlayerName = window.prompt("Make your own name!");
        if (newPlayerName === null) { return false; }

        const { success, msg, playerID } = await response(socket, "register", { type: "signUp", playerName: newPlayerName });
        if (!success) { console.log(msg); alert(msg); } // Wrong with name
        else {
            backupStorage();
            saveStorage({ playerName: newPlayerName, playerID }); const playerName = newPlayerName;
            socket.registered = true; socket.data.playerID = playerID; socket.data.playerName = playerName;
            console.log(`PlayerName : ${playerName}\nplayerID : ${playerID}\nDo not share playerID\nOther people can use it to impersonate you`);
            await afterRegister(socket);
            return true;
        }
    }
}

function getHTML(path) {
    const req = new XMLHttpRequest();
    if (!req) { return false; }
    req.onreadystatechange = function (req) {
        if (req.readyState !== XMLHttpRequest.DONE) { return false; }
        if (req.status === 200) { document.getElementById("htmlFrame").innerHTML = req.responseText; } else { alert("Problem with request"); return false; }
    }.bind(null, req);
    req.open("GET", path); req.send();
    return true;
}

function response(socket, event, ...args) {
    let resolveFunc = null;
    const result = new Promise((resolve, reject) => { resolveFunc = resolve; });
    socket.emit(event, ...args, ((func, response) => { func(response); }).bind(null, resolveFunc));
    return result;
}
