import { fetchLichessUserGames } from "@/core/lichess/export-games.js";
import { PAT } from "../../conf.js";

describe("Lichess export games", () => {
  let spaghettiGames;
  let tmevansGames;

  beforeAll(async () => {
    spaghettiGames = await fetchLichessUserGames(PAT, "Spaghetti_Spoghotti", "blitz", "white");
    tmevansGames = await fetchLichessUserGames(PAT, "tmevans", "rapid", "white");
  });

  it("should return result statistics", async () => {
    const stats = spaghettiGames.stats;

    expect(stats.win.mateRate).toBeGreaterThan(0);
    expect(stats.win.resignRate).toBeGreaterThan(0);
    expect(stats.win.outOfTimeRate).toBeGreaterThan(0);

    expect(stats.lose.mateRate).toBeGreaterThan(0);
    expect(stats.lose.resignRate).toBeGreaterThan(0);
    expect(stats.lose.outOfTimeRate).toBeGreaterThanOrEqual(0);
  });

  it("should return opening results with total wins", async () => {
    expect(tmevansGames.openings[0].insights.totals.win).toBeGreaterThan(0);
  });

  it("should return opening results and accuracies", async () => {
    const { insights } = spaghettiGames.openings.find((game) => game.name === "Queen's Pawn Game");
    expect(insights.results["lose"]?.mate).toBeGreaterThanOrEqual(0);
    expect(insights.numberOfGames).toBeGreaterThanOrEqual(0);
    expect(insights.accuracy).toBeGreaterThanOrEqual(0);
  });

  it("should return opening win rates and accuracies for opening variations", async () => {
    const { insights } = spaghettiGames.openings.find((game) => game.variations.length > 0);
    expect(insights.results.win.resign).toBeGreaterThanOrEqual(0);
    expect(insights.numberOfGames).toBeGreaterThanOrEqual(0);
    expect(insights.accuracy).toBeGreaterThanOrEqual(0);
  });

  it("should return sorted by number of games descending", async () => {
    const numberOfGamesList = spaghettiGames.openings.map((game) => game.insights.numberOfGames);
    expect(numberOfGamesList).toEqual([...numberOfGamesList].sort((a, b) => b - a));
  });
});
