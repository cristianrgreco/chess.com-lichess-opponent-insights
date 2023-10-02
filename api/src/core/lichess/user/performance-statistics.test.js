const { fetchLichessUserPerformanceStatistics } = require("./performance-statistics");

describe("Lichess performance statistics", () => {
  it("should return total number of games", async () => {
    const stats = await fetchLichessUserPerformanceStatistics("tmevans", "blitz");
    expect(stats.totalNumberOfGames).toBeGreaterThanOrEqual(3900);
  });

  it("should return a user's lowest rating", async () => {
    const stats = await fetchLichessUserPerformanceStatistics("tmevans", "blitz");
    expect(stats.lowestRating).toBeLessThan(1400);
  });

  it("should return a user's highest rating", async () => {
    const stats = await fetchLichessUserPerformanceStatistics("tmevans", "blitz");
    expect(stats.highestRating).toBeGreaterThan(1400);
  });

  it("should return a user's current rating", async () => {
    const stats = await fetchLichessUserPerformanceStatistics("tmevans", "blitz");
    expect(stats.currentRating).toBeGreaterThan(1400);
  });

  it("should return a user's current losing streak", async () => {
    const stats = await fetchLichessUserPerformanceStatistics("tmevans", "blitz");
    expect(stats.currentLosingStreak).toBeGreaterThanOrEqual(0);
  });

  it("should return a user's current winning streak", async () => {
    const stats = await fetchLichessUserPerformanceStatistics("tmevans", "blitz");
    expect(stats.currentWinningStreak).toBeGreaterThanOrEqual(0);
  });

  it("should return tilt mode true if loss greater gte 3", async () => {
    const stats = await fetchLichessUserPerformanceStatistics("iwishicouldcode", "blitz");
    expect(stats.tilt).toBe(true);
  });

  it("should return total number of disconnects", async () => {
    const stats = await fetchLichessUserPerformanceStatistics("tmevans", "blitz");
    expect(stats.totalNumberOfDisconnects).toBeGreaterThan(5);
  })
});