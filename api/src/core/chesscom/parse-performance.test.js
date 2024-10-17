import { parsePerformance } from "./parse-performance.js";
import { createGame, TEST_TIMESTAMP } from "./test-utils.js";

test("should parse stats performance", () => {
  const statsResponse = {
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
  const games = [createGame("abandoned", "blitz", "white"), createGame("win", "blitz", "white")];

  const performance = parsePerformance(statsResponse, games, "blitz", "white");

  expect(performance).toEqual(
    expect.objectContaining({
      lowestRating: 1186,
      lowestRatingDateTime: null,
      highestRating: 1346,
      highestRatingDateTime: "2024-09-12T20:06:53.000Z",
      currentRating: 1284,
      totalNumberOfGames: 146,
    }),
  );
});

describe("streaks", () => {
  const statsResponse = {
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

  test("should parse total number of disconnects", () => {
    const games = [createGame("abandoned", "blitz", "white")];

    const performance = parsePerformance(statsResponse, games, "blitz", "white");

    expect(performance.totalNumberOfDisconnects).toEqual(1);
  });

  test("should parse streaks when there are no games", () => {
    const games = [];

    const performance = parsePerformance(statsResponse, games, "blitz", "white");

    expect(performance.currentWinningStreak).toEqual(0);
    expect(performance.currentLosingStreak).toEqual(0);
  });

  test("should parse winning streak", () => {
    const games = [
      createGame("win", "blitz", "white", TEST_TIMESTAMP),
      createGame("resigned", "blitz", "white", TEST_TIMESTAMP - 1),
    ];

    const performance = parsePerformance(statsResponse, games, "blitz", "white");

    expect(performance.currentWinningStreak).toEqual(1);
    expect(performance.currentLosingStreak).toEqual(0);
  });

  test("should parse losing streak", () => {
    const games = [
      createGame("resigned", "blitz", "white", TEST_TIMESTAMP),
      createGame("win", "blitz", "white", TEST_TIMESTAMP - 1),
    ];

    const performance = parsePerformance(statsResponse, games, "blitz", "white");

    expect(performance.currentLosingStreak).toEqual(1);
    expect(performance.currentWinningStreak).toEqual(0);
  });

  test("should parse losing streak with different methods of losing", () => {
    const games = [
      createGame("resigned", "blitz", "white", TEST_TIMESTAMP),
      createGame("abandoned", "blitz", "white", TEST_TIMESTAMP - 1),
      createGame("timeout", "blitz", "white", TEST_TIMESTAMP - 2),
      createGame("win", "blitz", "white", TEST_TIMESTAMP - 3),
    ];

    const performance = parsePerformance(statsResponse, games, "blitz", "white");

    expect(performance.currentLosingStreak).toEqual(3);
    expect(performance.currentWinningStreak).toEqual(0);
  });

  test("should set tilt to true if lost >= 3 games in a row", () => {
    const games = [
      createGame("lose", "blitz", "white", TEST_TIMESTAMP),
      createGame("lose", "blitz", "white", TEST_TIMESTAMP - 1),
      createGame("lose", "blitz", "white", TEST_TIMESTAMP - 2),
    ];

    const performance = parsePerformance(statsResponse, games, "blitz", "white");

    expect(performance.tilt).toEqual(true);
  });

  test("should set tilt to false if lost < 3 games in a row", () => {
    const games = [
      createGame("lose", "blitz", "white", TEST_TIMESTAMP),
      createGame("lose", "blitz", "white", TEST_TIMESTAMP - 1),
      createGame("win", "blitz", "white", TEST_TIMESTAMP - 2),
    ];

    const performance = parsePerformance(statsResponse, games, "blitz", "white");

    expect(performance.tilt).toEqual(false);
  });
});
