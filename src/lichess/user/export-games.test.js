const { fetchUserGames } = require("./export-games");

jest.setTimeout(60000);

describe("Export games", () => {
  it("should return opening win rates and accuracies", async () => {
    const games = await fetchUserGames("Spaghetti_Spoghotti", "blitz", "white");

    const opening = games.openings["Queen's Pawn Game: Accelerated London System"];
    expect(opening.winRate).toBeGreaterThanOrEqual(0);
    expect(opening.numberOfGames).toBeGreaterThanOrEqual(0);
    expect(opening.accuracy).toBeGreaterThanOrEqual(0);
  });
});