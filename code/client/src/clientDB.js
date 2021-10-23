export function loadStorage() {
    return {
        playerID: localStorage.getItem("_playerID"),
        playerName: localStorage.getItem("_playerName"),
    };
}
export function saveStorage(data) {
    const { playerID, playerName } = data;
    localStorage.setItem("_playerID", playerID);
    localStorage.setItem("_playerName", playerName);
}
export function backupStorage() {
    if (localStorage.getItem("_playerID") !== null && localStorage.getItem("_playerName") !== null) {
        const { playerID, playerName } = loadStorage();
        localStorage.setItem(`_playerID_${new Date().toISOString()}`, playerID);
        localStorage.setItem(`_playerName_${new Date().toISOString()}`, playerName);
    }
    localStorage.removeItem("_playerID"); localStorage.removeItem("_playerName");
}
