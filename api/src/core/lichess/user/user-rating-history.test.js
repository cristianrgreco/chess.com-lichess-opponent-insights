const { fetchLichessUserRatingHistory } = require("./user-rating-history");

describe("Lichess user rating history", () => {
    it("should return latest puzzle rating", async () => {
        const stats = await fetchLichessUserRatingHistory("tmevans", "Puzzles");
        expect(stats.date).toBeDefined();
        expect(stats.value).toBeGreaterThan(0);
    });
});