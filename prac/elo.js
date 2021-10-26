const EloRating = require("elo-rating");

const initialRating = 2000;

function calcElo(playerRating, opponentRating, playerWin) {
    const k = 32;
    const result = EloRating.calculate(playerRating, opponentRating, playerWin, k);
    return { playerRating: result.playerRating, opponentRating: result.opponentRating };
}

module.exports = { calcElo };
