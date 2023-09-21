const { fetchUserPerformanceStatistics } = require("./performance-statistics");

describe("Performance statistics", () => {
  it("should return a user's highest rating", async () => {
    const userPerformanceStatistics = await fetchUserPerformanceStatistics("tmevans", "blitz");

    expect(userPerformanceStatistics._raw.stat.highest.int).toBeGreaterThan(1400);
    expect(userPerformanceStatistics._raw.stat.highest.at).toEqual(expect.stringMatching(/[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]+Z/));
  });

  it("should return a user's current losing streak", async () => {
    const userPerformanceStatistics = await fetchUserPerformanceStatistics("tmevans", "blitz");

    expect(userPerformanceStatistics._raw.stat.resultStreak.loss.cur.v).toBeGreaterThanOrEqual(0);
  });

  it("should return tilt mode true if loss greater gte 3", async () => {
    const userPerformanceStatistics = await fetchUserPerformanceStatistics("iwishicouldcode", "blitz");

    expect(userPerformanceStatistics.isTilt).toBe(true);
  });

  it("should return total number of games", async () => {
    const userPerformanceStatistics = await fetchUserPerformanceStatistics("tmevans", "blitz");

    expect(userPerformanceStatistics._raw.stat.count.all).toBeGreaterThanOrEqual(3900);
  });
});