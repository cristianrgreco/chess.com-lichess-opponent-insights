import { parsePerformance } from "./parse-performance.js";

test("should parse performance", () => {
  const response = {
    chess_blitz: {
      last: {
        rating: 1284,
        date: 1726599068,
        rd: 98,
      },
      best: {
        rating: 1346,
        date: 1726171613,
        game: "https://www.chess.com/game/live/84229755459",
      },
      record: {
        win: 99,
        loss: 45,
        draw: 2,
      },
    },
  };
  expect(parsePerformance(response, "blitz")).toEqual({
    lowestRating: 1186,
    lowestRatingDateTime: null,
    highestRating: 1346,
    highestRatingDateTime: "2024-09-12T20:06:53.000Z",
    currentRating: 1284,
    totalNumberOfGames: 146,
  });
});
