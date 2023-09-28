const { fetchLichessUserGames } = require("./export-games");

describe("Lichess export games", () => {
  it("should return opening win rates and accuracies", async () => {
    const games = await fetchLichessUserGames("Spaghetti_Spoghotti", "blitz", "white");

    const { insights } = games.find(game => game.opening === "Queen's Pawn Game: Accelerated London System");
    expect(insights.isOpeningFamily).toEqual(false);
    expect(insights.winRate).toBeGreaterThanOrEqual(0);
    expect(insights.numberOfGames).toBeGreaterThanOrEqual(0);
    expect(insights.accuracy).toBeGreaterThanOrEqual(0);
  });

  it("should return opening win rates and accuracies for opening families", async () => {
    const games = await fetchLichessUserGames("Spaghetti_Spoghotti", "blitz", "white");

    const { insights } = games.find(game => game.opening === "Queen's Pawn Game");
    expect(insights.isOpeningFamily).toEqual(true);
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

    expect(games.map(game => game.insights.numberOfGames)).not.toContain(1);
  });
});