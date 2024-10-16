import { chesscomDateToString } from "./utils.js";

export function parsePerformance(response, gameType) {
  const performance = response[`chess_${gameType}`];

  return {
    lowestRating: performance.last.rating - performance.last.rd, // rd = rating deviation
    lowestRatingDateTime: null, // missing from response
    highestRating: performance.best.rating,
    highestRatingDateTime: chesscomDateToString(performance.best.date),
    currentRating: performance.last.rating,
    totalNumberOfGames: performance.record.win + performance.record.loss + performance.record.draw,
  };
}
