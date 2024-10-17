import { fetchAnalytics } from "./fetch-analytics.js";

let machineAnalytics;

beforeAll(async () => {
  machineAnalytics = await fetchAnalytics("leanbeansteenmachine", "blitz", "white");
});

test("should return performance", async () => {
  expect(machineAnalytics.performance).toEqual({
    lowestRating: 1186,
    lowestRatingDateTime: null,
    highestRating: 1346,
    highestRatingDateTime: "2024-09-12T20:06:53.000Z",
    currentRating: 1284,
    totalNumberOfGames: 146,
    totalNumberOfDisconnects: 1,
    currentLosingStreak: 1,
    currentWinningStreak: 0,
    tilt: false,
  });
});

test("should return latest puzzle rating", async () => {
  expect(machineAnalytics.latestPuzzleRating).toEqual({
    date: "2022-06-26T09:32:10.000Z",
    value: 570,
  });
});

test("should return game stats", async () => {
  expect(machineAnalytics.games.stats).toEqual({
    numberOfGames: 60,
    win: {
      mateRate: 0.7,
      outOfTimeRate: 0,
      resignRate: 0.16666666666666666,
    },
    lose: {
      mateRate: 0.3,
      outOfTimeRate: 0.13333333333333333,
      resignRate: 0.3,
    },
  });
});

test("should return game openings", async () => {
  const opening = machineAnalytics.games.openings.find(
    (opening) => opening.name === "Queens Pawn Opening Accelerated London System",
  );

  expect(opening).toEqual({
    name: "Queens Pawn Opening Accelerated London System",
    insights: {
      numberOfGames: 10,
      results: {
        win: {
          resigned: 4,
          checkmated: 3,
          timeout: 2,
        },
        lose: {
          resigned: 1,
        },
        draw: {},
      },
      totals: {
        win: 9,
        lose: 1,
        draw: 0,
      },
    },
    variations: [],
  });
});

test("should return move times", async () => {
  expect(machineAnalytics.games.moveTimes[0]).toEqual([
    [300, 0.8999999999999773],
    [299.1, 1.2000000000000455],
    [297.9, 1.599999999999966],
    [296.3, 1.400000000000034],
    [294.9, 1.6999999999999886],
    [293.2, 7.800000000000011],
    [285.4, 4.2999999999999545],
    [281.1, 2.7000000000000455],
    [278.4, 6.2999999999999545],
    [272.1, 5.400000000000034],
  ]);
});
