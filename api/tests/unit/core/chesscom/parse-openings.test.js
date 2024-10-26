import { createGame } from "./test-utils.js";
import { parseOpenings } from "@/core/chesscom/parse-openings.js";

test("should parse opening names", () => {
  const games = [
    createGame("win", "blitz", "white", undefined, "Queens-Pawn-Opening-Mikenas-Defense-2.d5-Ne5"),
    createGame("win", "blitz", "white", undefined, "Alapin-Sicilian-Defense-2...d6-3.d4-cxd4-4.cxd4"),
    createGame("win", "blitz", "white", undefined, "Modern-Defense-with-1-d4...3.Bf4-d6-4.e3-Nf6"),
    createGame("win", "blitz", "white", undefined, "Indian-Game-2.Bf4-g6"),
    createGame("win", "blitz", "white", undefined, "London-System-3...c6-4.e3"),
  ];

  const openings = parseOpenings(games, "white");

  expect(openings[0].name).toEqual("Queens Pawn Opening Mikenas Defense 2.d5 Ne5");
  expect(openings[1].name).toEqual("Alapin Sicilian Defense 2...d6 3.d4 cxd4 4.cxd4");
  expect(openings[2].name).toEqual("Modern Defense with 1 d4...3.Bf4 d6 4.e3 Nf6");
  expect(openings[3].name).toEqual("Indian Game 2.Bf4 g6");
  expect(openings[4].name).toEqual("London System 3...c6 4.e3");
});

test("should parse number of games per opening", () => {
  const games = [
    createGame("win", "blitz", "white", undefined, "Queens-Pawn-Opening"),
    createGame("win", "blitz", "white", undefined, "Queens-Pawn-Opening"),
  ];

  const openings = parseOpenings(games, "white");

  expect(openings.length).toEqual(1);
  expect(openings[0].insights.numberOfGames).toEqual(2);
});

test("should always return empty variations", () => {
  const games = [createGame("win", "blitz", "white", undefined, "Queens-Pawn-Opening")];

  const openings = parseOpenings(games, "white");

  expect(openings[0].variations).toEqual([]);
});

test("should return totals", () => {
  const games = [
    createGame("win", "blitz", "white", undefined, "Queens-Pawn-Opening"),
    createGame("win", "blitz", "black", undefined, "Queens-Pawn-Opening"),
    createGame("stalemate", "blitz", "white", undefined, "Queens-Pawn-Opening"),
  ];

  const openings = parseOpenings(games, "white");

  expect(openings[0].insights.totals).toEqual({
    win: 1,
    lose: 1,
    draw: 1,
  });
});

test("should be sorted by number of games descending", () => {
  const games = [
    createGame("win", "blitz", "white", undefined, "Kings-Pawn-Opening"),
    createGame("win", "blitz", "white", undefined, "Queens-Pawn-Opening"),
    createGame("win", "blitz", "white", undefined, "Queens-Pawn-Opening"),
  ];

  const openings = parseOpenings(games, "white");

  expect(openings[0].insights.numberOfGames).toEqual(2);
  expect(openings[1].insights.numberOfGames).toEqual(1);
});

test("should return breakdown of wins", () => {
  const games = [
    createGame("win", "blitz", "white", undefined, "Queens-Pawn-Opening", "timeout"),
    createGame("win", "blitz", "white", undefined, "Queens-Pawn-Opening", "checkmated"),
  ];

  const openings = parseOpenings(games, "white");

  expect(openings[0].insights.results.win).toEqual({
    timeout: 1,
    checkmated: 1,
  });
});

test("should return breakdown of losses", () => {
  const games = [
    createGame("timeout", "blitz", "white", undefined, "Queens-Pawn-Opening", "win"),
    createGame("checkmated", "blitz", "white", undefined, "Queens-Pawn-Opening", "win"),
  ];

  const openings = parseOpenings(games, "white");

  expect(openings[0].insights.results.lose).toEqual({
    timeout: 1,
    checkmated: 1,
  });
});

test("should return breakdown of draws", () => {
  const games = [
    createGame("stalemate", "blitz", "white", undefined, "Queens-Pawn-Opening", "stalemate"),
    createGame("agreed", "blitz", "white", undefined, "Queens-Pawn-Opening", "agreed"),
    createGame("insufficient", "blitz", "white", undefined, "Queens-Pawn-Opening", "insufficient"),
    createGame("50move", "blitz", "white", undefined, "Queens-Pawn-Opening", "50move"),
    createGame("timevsinsufficient", "blitz", "white", undefined, "Queens-Pawn-Opening", "timevsinsufficient"),
  ];

  const openings = parseOpenings(games, "white");

  expect(openings[0].insights.results.draw).toEqual({
    stalemate: 1,
    agreed: 1,
    insufficient: 1,
    "50move": 1,
    timevsinsufficient: 1,
  });
});
