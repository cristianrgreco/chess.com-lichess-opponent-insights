import { fetchLichessUserGames } from "./export-games.js";
import { PAT } from "../../../test/conf.js";

describe("Lichess export games", () => {
  it("should return result statistics", async () => {
    const games = await fetchLichessUserGames(PAT, "Spaghetti_Spoghotti", "blitz", "white");

    expect(games.stats.win.mateRate).toBeGreaterThan(0);
    expect(games.stats.win.resignRate).toBeGreaterThan(0);
    expect(games.stats.win.outOfTimeRate).toBeGreaterThan(0);

    expect(games.stats.lose.mateRate).toBeGreaterThan(0);
    expect(games.stats.lose.resignRate).toBeGreaterThan(0);
    expect(games.stats.lose.outOfTimeRate).toBeGreaterThanOrEqual(0);
  });

  it("should return opening results with total wins", async () => {
    const games = await fetchLichessUserGames(PAT, "tmevans", "rapid", "white");
    expect(games.openings[0].insights.totals.win).toBeGreaterThan(0);
  });

  it("should return opening results and accuracies", async () => {
    const games = await fetchLichessUserGames(PAT, "Spaghetti_Spoghotti", "blitz", "white");

    const { insights } = games.openings.find((game) => game.name === "Queen's Pawn Game");
    expect(insights.results["win"]?.mate).toBeGreaterThanOrEqual(0);
    expect(insights.numberOfGames).toBeGreaterThanOrEqual(0);
    expect(insights.accuracy).toBeGreaterThanOrEqual(0);
  });

  it("should return opening win rates and accuracies for opening variations", async () => {
    const games = await fetchLichessUserGames(PAT, "Spaghetti_Spoghotti", "blitz", "white");

    const openingFamily = games.openings.find((game) => game.name === "Queen's Pawn Game");
    const { insights } = openingFamily.variations.find((variation) => variation.name === "Accelerated London System");
    expect(insights.results.win.mate).toBeGreaterThanOrEqual(0);
    expect(insights.numberOfGames).toBeGreaterThanOrEqual(0);
    expect(insights.accuracy).toBeGreaterThanOrEqual(0);
  });

  it("should return sorted by number of games descending", async () => {
    const games = await fetchLichessUserGames(PAT, "Spaghetti_Spoghotti", "blitz", "white");

    const numberOfGamesList = games.openings.map((game) => game.insights.numberOfGames);
    expect(numberOfGamesList).toEqual([...numberOfGamesList].sort((a, b) => b - a));
  });
});
