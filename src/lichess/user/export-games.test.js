const { fetchUserGames } = require("./export-games");

describe("Export games", () => {
  it("should return opening win rates and accuracies", async () => {
    const games = await fetchUserGames("Spaghetti_Spoghotti", "blitz", "white");

    const opening = games.openings["Queen's Pawn Game: Accelerated London System"];
    expect(opening.winRate).toBeGreaterThanOrEqual(0);
    expect(opening.numberOfGames).toBeGreaterThanOrEqual(0);
    expect(opening.accuracy).toBeGreaterThanOrEqual(0);
  });

  it("should return opening win rates and accuracies for opening families", async () => {
    const games = await fetchUserGames("Spaghetti_Spoghotti", "blitz", "white");

    const [,queensPawnOpeningFamilyInsights] = Object.entries(games.openings).filter(([key, value]) => value.isOpeningFamily === true && key === "Queen's Pawn Game")[0];
    expect(queensPawnOpeningFamilyInsights.winRate).toBeGreaterThanOrEqual(0);
    expect(queensPawnOpeningFamilyInsights.numberOfGames).toBeGreaterThanOrEqual(0);
    expect(queensPawnOpeningFamilyInsights.accuracy).toBeGreaterThanOrEqual(0);
    console.log(Object.entries(games.openings).filter(([key, value]) => value.isOpeningFamily === true)[0])
  });
});