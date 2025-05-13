import { fetchLichessUserPerformanceStatistics } from "@/core/lichess/performance-statistics.js";
import { PAT } from "../../conf.js";

describe("Lichess performance statistics", () => {
  let games;

  beforeAll(async () => {
    games = await fetchLichessUserPerformanceStatistics(PAT, "Spaghetti_Spoghotti", "blitz");
  });

  it("should return total number of games", async () => {
    expect(games.totalNumberOfGames).toBeGreaterThanOrEqual(9000);
  });

  it("should return a user's lowest rating", async () => {
    expect(games.lowestRating).toBeLessThan(1400);
  });

  it("should return a user's highest rating", async () => {
    expect(games.highestRating).toBeGreaterThan(1400);
  });

  it("should return a user's current rating", async () => {
    expect(games.currentRating).toBeGreaterThan(1400);
  });

  it("should return a user's current losing streak", async () => {
    expect(games.currentLosingStreak).toBeGreaterThanOrEqual(0);
  });

  it("should return a user's current winning streak", async () => {
    expect(games.currentWinningStreak).toBeGreaterThanOrEqual(0);
  });

  it("should return tilt mode true if loss greater gte 3", async () => {
    expect(games.tilt).toBe(true);
  });

  it("should return total number of disconnects", async () => {
    expect(games.totalNumberOfDisconnects).toBeGreaterThan(5);
  });
});
