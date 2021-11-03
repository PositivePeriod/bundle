interface Player {
    name: string,
    playerName: string,

}

class GamePlayer implements Player {
    name: string;

    playerName: string;

    constructor(name: string, playerName: string) {
        this.name = name;
        this.playerName = playerName;
    }
}

module.exports = { GamePlayer };
