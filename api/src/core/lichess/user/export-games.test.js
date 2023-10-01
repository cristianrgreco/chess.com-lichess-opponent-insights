const { fetchLichessUserGames } = require("./export-games");

describe("Lichess export games", () => {
  it("should return opening win rates and accuracies", async () => {
    const games = await fetchLichessUserGames("Spaghetti_Spoghotti", "blitz", "white");

    const { insights } = games.find(game => game.name === "Queen's Pawn Game");
    expect(insights.winRate).toBeGreaterThanOrEqual(0);
    expect(insights.numberOfGames).toBeGreaterThanOrEqual(0);
    expect(insights.accuracy).toBeGreaterThanOrEqual(0);
  });

  it("should return opening win rates and accuracies for opening variations", async () => {
    const games = await fetchLichessUserGames("Spaghetti_Spoghotti", "blitz", "white");

    const openingFamily = games.find(game => game.name === "Queen's Pawn Game");
    const { insights } = openingFamily.variations.find(variation => variation.name === "Accelerated London System");
    expect(insights.winRate).toBeGreaterThanOrEqual(0);
    expect(insights.numberOfGames).toBeGreaterThanOrEqual(0);
    expect(insights.accuracy).toBeGreaterThanOrEqual(0);
  });

  it("should return sorted by number of games descending", async () => {
    const games = await fetchLichessUserGames("Spaghetti_Spoghotti", "blitz", "white");

    const numberOfGamesList = games.map(game => game.insights.numberOfGames);
    expect(numberOfGamesList).toEqual([...numberOfGamesList].sort((a, b) => b - a));
  });

  it("should exclude games where the opening has only been played once", async () => {
    const games = await fetchLichessUserGames("Spaghetti_Spoghotti", "blitz", "white");

    games.forEach(game => expect(game.insights.numberOfGames).toBeGreaterThan(1))
  });
});