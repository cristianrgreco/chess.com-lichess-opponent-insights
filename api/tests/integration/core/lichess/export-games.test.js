import { fetchLichessUserGames } from "@/core/lichess/export-games.js";
import { PAT } from "../../conf.js";

describe("Lichess export games", () => {
  let games;

  beforeAll(async () => {
    games = await fetchLichessUserGames(PAT, "Spaghetti_Spoghotti", "blitz", "white");
  });

  it("should return result statistics", async () => {
    const stats = games.stats;

    expect(stats.win.mateRate).toBeGreaterThanOrEqual(0);
    expect(stats.win.resignRate).toBeGreaterThanOrEqual(0);
    expect(stats.win.outOfTimeRate).toBeGreaterThanOrEqual(0);

    expect(stats.lose.mateRate).toBeGreaterThanOrEqual(0);
    expect(stats.lose.resignRate).toBeGreaterThanOrEqual(0);
    expect(stats.lose.outOfTimeRate).toBeGreaterThanOrEqual(0);
  });

  it("should return opening results with total wins", async () => {
    expect(games.openings[0].insights.totals.win).toBeGreaterThanOrEqual(0);
  });

  it("should return opening results and accuracies", async () => {
    const { insights } = games.openings.find((game) => game.name === "Queen's Pawn Game");
    expect(insights.results["win"]?.mate).toBeGreaterThanOrEqual(0);
    expect(insights.numberOfGames).toBeGreaterThanOrEqual(0);
    expect(insights.accuracy).toBeGreaterThanOrEqual(0);
  });

  it("should return opening win rates and accuracies for opening variations", async () => {
    const { insights } = games.openings.find((game) => game.variations.length > 0);
    expect(insights.results.win.resign).toBeGreaterThanOrEqual(0);
    expect(insights.numberOfGames).toBeGreaterThanOrEqual(0);
    expect(insights.accuracy).toBeGreaterThanOrEqual(0);
  });

  it("should return sorted by number of games descending", async () => {
    const numberOfGamesList = games.openings.map((game) => game.insights.numberOfGames);
    expect(numberOfGamesList).toEqual([...numberOfGamesList].sort((a, b) => b - a));
  });
});
