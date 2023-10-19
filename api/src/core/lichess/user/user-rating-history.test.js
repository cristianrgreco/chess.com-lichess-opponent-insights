const {fetchLichessUserRatingHistory} = require("./user-rating-history");

describe("Lichess user rating history", () => {
  it("should return latest puzzle rating", async () => {
    const stats = await fetchLichessUserRatingHistory("tmevans", "Puzzles");
    expect(stats.date).toBeDefined();
    expect(stats.value).toBeGreaterThan(0);
  });

  it("should not break if a user doesn't have a puzzle rating", async () => {
    const stats = await fetchLichessUserRatingHistory("iwishicouldcode", "Puzzles");
    expect(stats.date).toBeUndefined();
    expect(stats.value).toBeUndefined();
  });
});