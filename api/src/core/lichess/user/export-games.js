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
        results: [],
        variations: []
      }
      openingsStats.push(openingStats);
    }

    let variationStats = openingsStats.find(opening => opening.name).variations.find(variation => variation.name === opening.variationName);
    if (variationStats === undefined) {
      variationStats = {
        name: opening.variationName,
        accuracies: [],
        results: []
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

    openingStats.results.push(record.status);
    if (opening.variationName) {
      variationStats.results.push(record.status);
    }
  }

  const sortOpeningsByNumberOfGamesDesc = (a, b) =>
      b.insights.numberOfGames - a.insights.numberOfGames;
  const calculateResultRates = results =>
      results.reduce((prev, next) => ({...prev, [next]: (prev[next] ?? 0) + 1}), {});
  const calculateAccuracy = accuracies => accuracies.length === 0
      ? undefined
      : accuracies.reduce((prev, next) => prev + next, 0) / accuracies.length

  const openings = openingsStats
    .filter(openingStats => openingStats.results.length > 1) // showing a game which has only been played once does not provide useful insights
    .map(openingStats => ({
      name: openingStats.name,
      insights: {
        numberOfGames: openingStats.results.length,
        results: calculateResultRates(openingStats.results),
        accuracy: calculateAccuracy(openingStats.accuracies)
      },
      variations: openingStats.variations
        .map(variation => ({
          name: variation.name,
          insights: {
            numberOfGames: variation.results.length,
            results: calculateResultRates(variation.results),
            accuracy: calculateAccuracy(variation.accuracies)
          }
        }))
        .sort(sortOpeningsByNumberOfGamesDesc)
    }))
    .sort(sortOpeningsByNumberOfGamesDesc)

  const rawStats = openings.reduce((prev, next) => ({
    numberOfGames: (prev.numberOfGames ?? 0) + next.insights.numberOfGames,
    mateCount: (prev.mateCount ?? 0) + (next.insights.results.mate ?? 0),
    resignCount: (prev.resignCount ?? 0) + (next.insights.results.resign ?? 0),
    drawCount: (prev.drawCount ?? 0) + (next.insights.results.draw ?? 0),
    stalemateCount: (prev.stalemateCount ?? 0) + (next.insights.results.stalemate ?? 0),
    outOfTimeCount: (prev.outOfTimeCount ?? 0) + (next.insights.results.outoftime ?? 0),
  }), {});

  const stats = {
    mateRate: rawStats.mateCount / rawStats.numberOfGames,
    resignRate: rawStats.resignCount / rawStats.numberOfGames,
    drawRate: rawStats.drawCount / rawStats.numberOfGames,
    stalemateRate: rawStats.stalemateCount / rawStats.numberOfGames,
    outOfTimeRate: rawStats.outOfTimeCount / rawStats.numberOfGames,
  };

  return {
    stats,
    openings
  };
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

module.exports = {
  fetchLichessUserGames
};