const fetch = require("node-fetch");
const ndjson = require('ndjson')
const {PAT} = require("../../../conf");

async function fetchLichessUserGames(username, gameType, colour) {
  const params = new URLSearchParams({
    max: 60, // maximum number of games Lichess will return if a PAT is provided
    rated: true,
    perfType: gameType,
    color: colour,
    tags: true,
    clocks: true,
    accuracy: true,
    opening: true
  });
  const headers = {
    "Authorization": `Bearer ${PAT}`,
    "Accept": "application/x-ndjson",
  };
  const response = await fetch(`https://lichess.org/api/games/user/${username}?${params}`, {headers})

  if (response.status !== 200) {
    return;
  }

  const ndjsonParserResponseStream = response.body.pipe(ndjson.parse());
  const openingsStats = [];

  for await (const record of ndjsonParserResponseStream) {
    const opening = parseOpeningName(record.opening.name);

    let openingStats = openingsStats.find(anOpening => anOpening.name === opening.name);
    if (openingStats === undefined) {
      openingStats = {
        name: opening.name,
        accuracies: [],
        results: {"win": [], "lose": [], "draw": []},
        totals: {},
        variations: []
      }
      openingsStats.push(openingStats);
    }

    let variationStats = openingsStats.find(opening => opening.name).variations.find(variation => variation.name === opening.variationName);
    if (variationStats === undefined) {
      variationStats = {
        name: opening.variationName,
        accuracies: [],
        results: {"win": [], "lose": [], "draw": []},
        totals: {}
      }
      if (opening.variationName) {
        openingsStats.find(opening => opening.name).variations.push(variationStats);
      }
    }

    const accuracy = record.players[colour].analysis?.accuracy;
    if (accuracy) {
      openingStats.accuracies.push(accuracy);
      if (opening.variationName) {
        variationStats.accuracies.push(accuracy);
      }
    }
    let gameResult = calculateGameResult(record.winner, colour);
    openingStats.results[gameResult].push(record.status);
    if (opening.variationName) {
      variationStats.results[gameResult].push(record.status);
    }
  }

  const sortOpeningsByNumberOfGamesDesc = (a, b) =>
      b.insights.numberOfGames - a.insights.numberOfGames;
  const calculateAccuracy = accuracies => accuracies.length === 0
      ? undefined
      : accuracies.reduce((prev, next) => prev + next, 0) / accuracies.length

  const openings = openingsStats// showing a game which has only been played once does not provide useful insights
    .map(openingStats => ({
      name: openingStats.name,
      insights: {
        numberOfGames: Object.values(Object.values(openingStats.results)).reduce((prev, next) => prev + next.length, 0),
        results: calculateGameResultStatusCounts(openingStats.results),
        totals: calculateTotalGameStatusesCount(openingStats.results),
        accuracy: calculateAccuracy(openingStats.accuracies)
      },
      variations: openingStats.variations
        .map(variation => ({
          name: variation.name,
          insights: {
            numberOfGames: variation.results.length,
            results: calculateGameResultStatusCounts(variation.results),
            totals: calculateTotalGameStatusesCount(openingStats.results),
            accuracy: calculateAccuracy(variation.accuracies)
          }
        }))
        .sort(sortOpeningsByNumberOfGamesDesc)
    }))
    .sort(sortOpeningsByNumberOfGamesDesc)

  // @tom todo these stats are now for wins only. Do we want overall/wins/loses/draws?
  const rawStats = openings.reduce((prev, next) => ({
    numberOfGames: (prev.numberOfGames ?? 0) + next.insights.numberOfGames,
    winMateCount: (prev.winMateCount ?? 0) + (next.insights.results["win"].mate ?? 0),
    winResignCount: (prev.winResignCount ?? 0) + (next.insights.results["win"].resign ?? 0),
    winDrawCount: (prev.winDrawCount ?? 0) + (next.insights.results["win"].draw ?? 0),
    winStalemateCount: (prev.winStalemateCount ?? 0) + (next.insights.results["win"].stalemate ?? 0),
    winOutOfTimeCount: (prev.winOutOfTimeCount ?? 0) + (next.insights.results["win"].outoftime ?? 0),
    loseMateCount: (prev.loseMateCount ?? 0) + (next.insights.results["lose"].mate ?? 0),
    loseResignCount: (prev.loseResignCount ?? 0) + (next.insights.results["lose"].resign ?? 0),
    loseDrawCount: (prev.loseDrawCount ?? 0) + (next.insights.results["lose"].draw ?? 0),
    loseStalemateCount: (prev.loseStalemateCount ?? 0) + (next.insights.results["lose"].stalemate ?? 0),
    loseOutOfTimeCount: (prev.loseOutOfTimeCount ?? 0) + (next.insights.results["lose"].outoftime ?? 0),
  }), {});

  const stats =
      numberOfGames: (prev.numberOfGames ?? 0) + next.insights.numberOfGames,
      win = {
        mateCount: rawStats.winMateCount / rawStats.numberOfGames,
        resignCount: rawStats.winResignCount / rawStats.numberOfGames,
        drawCount: rawStats.winDrawCount / rawStats.numberOfGames,
        stalemateCount: rawStats.winStalemateCount / rawStats.numberOfGames,
        outOfTimeCount: rawStats.winOutOfTimeCount / rawStats.numberOfGames,

      },
    lose = {
      mateCount: rawStats.loseMateCount / rawStats.numberOfGames,
      resignCount: rawStats.loseResignCount / rawStats.numberOfGames,
      drawCount: rawStats.loseDrawCount / rawStats.numberOfGames,
      stalemateCount: rawStats.loseStalemateCount / rawStats.numberOfGames,
      outOfTimeCount: rawStats.loseOutOfTimeCount / rawStats.numberOfGames,
    };

  return {
    stats,
    openings
  };
}

/*
 * Input: { win: ["mate", "resign"], lose: ["mate", "resign"] }
 * Output: { win: { mate: 1, resign: 1 }, lose: { mate: 1, resign: 1 } }
 */
function calculateGameResultStatusCounts(gameResultStatuses) {
  return Object.entries(gameResultStatuses).reduce(
      (gameResultStatusCounts, [resultStatus, resultTypes]) => ({
        ...gameResultStatusCounts,
        [resultStatus]: resultTypes.reduce(
            (resultStatuses, resultType) => ({...resultStatuses, [resultType]: (resultStatuses[resultType] ?? 0) + 1}),
            {})
      }), {"win": {}, "lose": {}, "draw": {}});
}

function calculateTotalGameStatusesCount(gameResultStatuses) {
  return Object.entries(gameResultStatuses).reduce(
      (gameResultTotalCounts, [resultStatus, resultTypes]) => ({
        ...gameResultTotalCounts,
        [resultStatus]: resultTypes.length
      }), {"win": 0, "lose": 0, "draw": 0}
  );
}

function parseOpeningName(openingName) {
  const [opening, variation] = openingName.split(": ");

  if (opening === undefined) {
    return {name};
  }
  return {
    name: opening,
    variationName: variation
  };
}

function calculateGameResult(winner, colour) {
  if(winner === undefined) {
    return "draw";
  }
  return winner === colour ? "win" : "lose";
}

module.exports = {
  fetchLichessUserGames
};