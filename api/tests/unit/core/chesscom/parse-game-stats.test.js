import { parseGameStats } from "@/core/chesscom/parse-game-stats.js";
import { createGame } from "./test-utils.js";

test("should return number of games", () => {
  const games = [createGame("win", "blitz", "white"), createGame("win", "blitz", "white")];

  const gameStats = parseGameStats(games, "white");

  expect(gameStats.numberOfGames).toEqual(2);
});

test("should return win rates", () => {
  const games = [
    createGame("win", "blitz", "white"),
    createGame("resigned", "blitz", "white"),
    createGame("timeout", "blitz", "white"),
  ];

  const opponentColour = "white";
  const gameStats = parseGameStats(games, opponentColour);

  expect(gameStats.win.mateRate).toBeCloseTo(0.333);
  expect(gameStats.win.resignRate).toBeCloseTo(0.333);
  expect(gameStats.win.outOfTimeRate).toBeCloseTo(0.333);
});

test("should return loss rates", () => {
  const games = [
    createGame("win", "blitz", "black"),
    createGame("resigned", "blitz", "black"),
    createGame("timeout", "blitz", "black"),
  ];

  const opponentColour = "white";
  const gameStats = parseGameStats(games, opponentColour);

  expect(gameStats.lose.mateRate).toBeCloseTo(0.333);
  expect(gameStats.lose.resignRate).toBeCloseTo(0.333);
  expect(gameStats.lose.outOfTimeRate).toBeCloseTo(0.333);
});
