import { fetchLichessUserPerformanceStatistics } from "./performance-statistics.js";
import { PAT } from "../../test/conf.js";

describe("Lichess performance statistics", () => {
  let tmevansGames;
  let codeGames;

  beforeAll(async () => {
    tmevansGames = await fetchLichessUserPerformanceStatistics(PAT, "tmevans", "blitz");
    codeGames = await fetchLichessUserPerformanceStatistics(PAT, "iwishicouldcode", "blitz");
  });

  it("should return total number of games", async () => {
    expect(tmevansGames.totalNumberOfGames).toBeGreaterThanOrEqual(3900);
  });

  it("should return a user's lowest rating", async () => {
    expect(tmevansGames.lowestRating).toBeLessThan(1400);
  });

  it("should return a user's highest rating", async () => {
    expect(tmevansGames.highestRating).toBeGreaterThan(1400);
  });

  it("should return a user's current rating", async () => {
    expect(tmevansGames.currentRating).toBeGreaterThan(1400);
  });

  it("should return a user's current losing streak", async () => {
    expect(tmevansGames.currentLosingStreak).toBeGreaterThanOrEqual(0);
  });

  it("should return a user's current winning streak", async () => {
    expect(tmevansGames.currentWinningStreak).toBeGreaterThanOrEqual(0);
  });

  it("should return tilt mode true if loss greater gte 3", async () => {
    expect(codeGames.tilt).toBe(true);
  });

  it("should return total number of disconnects", async () => {
    expect(tmevansGames.totalNumberOfDisconnects).toBeGreaterThan(5);
  });
});
