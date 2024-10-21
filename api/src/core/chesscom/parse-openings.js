import { flipColour } from "./utils.js";

export function parseOpenings(games, colour) {
  const openings = new Map();

  for (const game of games) {
    const openingName = parseOpeningName(game);

    if (openings.has(openingName)) {
      const currentOpening = openings.get(openingName);
      openings.set(openingName, updatedOpening(currentOpening, game, colour));
    } else {
      openings.set(openingName, newOpening(openingName, game, colour));
    }
  }

  const results = Array.from(openings.values());
  const sortByNumberOfGamesDesc = (a, b) => b.insights.numberOfGames - a.insights.numberOfGames;
  results.sort(sortByNumberOfGamesDesc);

  return results;
}

function parseOpeningName(game) {
  return game.eco.split("/").pop().replace(/-/g, " ");
}

function newOpening(openingName, game, colour) {
  return {
    name: openingName,
    insights: {
      numberOfGames: 1,
      totals: updateTotals({ win: 0, lose: 0, draw: 0 }, game, colour),
      results: updateResults({ win: {}, lose: {}, draw: {} }, game, colour),
    },
    variations: [],
  };
}

function updatedOpening(opening, game, colour) {
  return {
    ...opening,
    insights: {
      ...opening.insights,
      numberOfGames: opening.insights.numberOfGames + 1,
      totals: updateTotals(opening.insights.totals, game, colour),
      results: updateResults(opening.insights.results, game, colour),
    },
  };
}

function updateTotals(totals, game, colour) {
  if (game[colour].result === "win") {
    return { ...totals, win: totals.win + 1 };
  } else if (game[flipColour(colour)].result === "win") {
    return { ...totals, lose: totals.lose + 1 };
  } else {
    return { ...totals, draw: totals.draw + 1 };
  }
}

function updateResults(results, game, colour) {
  if (game[colour].result === "win") {
    const winReason = game[flipColour(colour)].result;
    const winReasonCount = results.win[winReason] ? results.win[winReason] : 0;
    return { ...results, win: { ...results.win, [winReason]: winReasonCount + 1 } };
  } else if (game[flipColour(colour)].result === "win") {
    const loseReason = game[colour].result;
    const loseReasonCount = results.lose[loseReason] ? results.lose[loseReason] : 0;
    return { ...results, lose: { ...results.lose, [loseReason]: loseReasonCount + 1 } };
  } else {
    const drawReason = game[colour].result;
    const drawReasonCount = results.draw[drawReason] ? results.draw[drawReason] : 0;
    return { ...results, draw: { ...results.draw, [drawReason]: drawReasonCount + 1 } };
  }
}
