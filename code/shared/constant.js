const MSG = Object.freeze({
    CONNECT_SERVER: "connect",
    SET_USERID: "setUSERID",
    SET_USERNAME: "setUSERNAME",

    JOIN_PLAY: "joinPlay",
    HANDLE_INPUT: "handleInput",
    LEAVE_PLAY: "leavePlay",

    SEND_PROBLEM: "sendProblem",
    SEND_HINT: "sendHint",
    SEND_ACHIEVEMENT: "sendAchievement",

    JOIN_SPECTATE: "joinSpectate",
    LEAVE_SPECTATE: "joinSpectate",

    UPDATE_GAME: "updateGame",

    DISCONNECT_SERVER: "disconnect",
});

module.exports = { MSG };
