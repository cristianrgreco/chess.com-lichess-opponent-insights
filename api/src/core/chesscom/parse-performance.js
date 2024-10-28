import { chesscomDateToString } from "./utils.js";

export function parsePerformance(statsResponse, games, gameType, colour) {
  const performance = statsResponse[`chess_${gameType}`];
  const currentStreak = calculateStreak(games, colour);

  return {
    lowestRating: performance.last.rating - performance.last.rd, // rd = rating deviation
    lowestRatingDateTime: null, // missing from response
    ...calculateHighestRating(performance),
    currentRating: performance.last.rating,
    totalNumberOfGames: performance.record.win + performance.record.loss + performance.record.draw,
    totalNumberOfDisconnects: games.filter((game) => game[colour].result === "abandoned").length,
    currentLosingStreak: currentStreak < 0 ? -currentStreak : 0,
    currentWinningStreak: currentStreak > 0 ? currentStreak : 0,
    tilt: currentStreak <= -3,
  };
}

function calculateHighestRating(performance) {
  if (performance.best) {
    return {
      highestRating: performance.best.rating,
      highestRatingDateTime: chesscomDateToString(performance.best.date),
    };
  } else {
    return {
      highestRating: performance.last.rating + performance.last.rd,
      highestRatingDateTime: chesscomDateToString(performance.last.date),
    };
  }
}

function calculateStreak(games, colour) {
  let isLastResultWin = undefined;
  let currentStreak = 0;

  for (const game of games) {
    const result = game[colour].result;

    if ((isLastResultWin === true && result !== "win") || (isLastResultWin === false && result === "win")) {
      break;
    }

    if (isLastResultWin === undefined) {
      isLastResultWin = result === "win";
    }

    if (result === "win") {
      currentStreak++;
    } else {
      currentStreak--;
    }
  }

  return currentStreak;
}
