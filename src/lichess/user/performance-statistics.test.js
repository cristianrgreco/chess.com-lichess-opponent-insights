const {fetchUserPerformanceStatistics} = require("./performance-statistics");

describe("Performance statistics", () => {
  it("should return a user's highest rating", async () => {
    const userPerformanceStatistics = await fetchUserPerformanceStatistics("tmevans", "blitz");

    expect(userPerformanceStatistics.stat.highest.int).toBeGreaterThan(1400);
    expect(userPerformanceStatistics.stat.highest.at).toEqual(expect.stringMatching(/[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]+Z/));
  });
});