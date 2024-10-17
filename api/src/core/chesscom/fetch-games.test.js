import nock from "nock";
import { fetchGames } from "./fetch-games.js";
import { createGame } from "./test-utils.js";

let scope;

beforeEach(() => {
  scope = nock("https://api.chess.com");
});

test("should return the last X games", async () => {
  const expectedGames = [
    createGame("win", "blitz", "white"),
    createGame("resigned", "blitz", "white"),
    createGame("timeout", "blitz", "white"),
  ];
  scope.get("/pub/player/opponent/games/archives").reply(200, {
    archives: ["https://api.chess.com/pub/player/opponent/games/2024/10"],
  });
  scope.get("/pub/player/opponent/games/2024/10").reply(200, { games: expectedGames });

  const games = await fetchGames(3, "opponent", "blitz", "white");

  expect(games).toEqual(expectedGames);
});

test("should return the last X games where opponent name is case insensitive", async () => {
  const expectedGames = [
    createGame("win", "blitz", "white"),
    createGame("resigned", "blitz", "white"),
    createGame("timeout", "blitz", "white"),
  ];
  scope.get("/pub/player/OPPONENT/games/archives").reply(200, {
    archives: ["https://api.chess.com/pub/player/OPPONENT/games/2024/10"],
  });
  scope.get("/pub/player/OPPONENT/games/2024/10").reply(200, { games: expectedGames });

  const games = await fetchGames(3, "OPPONENT", "blitz", "white");

  expect(games).toEqual(expectedGames);
});

test("should fetch from multiple archives until last X games returned in descending chronological order", async () => {
  const expectedGames = [
    createGame("win", "blitz", "white"),
    createGame("resigned", "blitz", "white"),
    createGame("timeout", "blitz", "white"),
  ];
  scope.get("/pub/player/opponent/games/archives").reply(200, {
    archives: [
      "https://api.chess.com/pub/player/opponent/games/2024/10",
      "https://api.chess.com/pub/player/opponent/games/2024/11",
      "https://api.chess.com/pub/player/opponent/games/2024/12",
    ],
  });
  scope.get("/pub/player/opponent/games/2024/10").reply(200, { games: [expectedGames[2]] });
  scope.get("/pub/player/opponent/games/2024/11").reply(200, { games: [expectedGames[1]] });
  scope.get("/pub/player/opponent/games/2024/12").reply(200, { games: [expectedGames[0]] });

  const games = await fetchGames(3, "opponent", "blitz", "white");

  expect(games).toEqual(expectedGames);
});

test("should return games by type", async () => {
  const expectedGames = [
    createGame("win", "blitz", "white"),
    createGame("resigned", "blitz", "white"),
    createGame("timeout", "blitz", "white"),
  ];
  scope.get("/pub/player/opponent/games/archives").reply(200, {
    archives: ["https://api.chess.com/pub/player/opponent/games/2024/10"],
  });
  scope.get("/pub/player/opponent/games/2024/10").reply(200, {
    games: [createGame("win", "rapid", "white"), ...expectedGames, createGame("win", "rapid", "white")],
  });

  const games = await fetchGames(3, "opponent", "blitz", "white");

  expect(games).toEqual(expectedGames);
});

test("should return games by colour", async () => {
  const expectedGames = [
    createGame("win", "blitz", "white"),
    createGame("resigned", "blitz", "white"),
    createGame("timeout", "blitz", "white"),
  ];
  scope.get("/pub/player/opponent/games/archives").reply(200, {
    archives: ["https://api.chess.com/pub/player/opponent/games/2024/10"],
  });
  scope.get("/pub/player/opponent/games/2024/10").reply(200, {
    games: [createGame("win", "blitz", "black"), ...expectedGames, createGame("win", "blitz", "black")],
  });

  const games = await fetchGames(3, "opponent", "blitz", "white");

  expect(games).toEqual(expectedGames);
});
