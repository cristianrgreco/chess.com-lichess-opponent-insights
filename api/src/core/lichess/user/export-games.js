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
  const ndjsonParserResponseStream = response.body.pipe(ndjson.parse());
  const openingsStats = [];

  for await (const record of ndjsonParserResponseStream) {
    // temporarily skip games where there is no winner (stalemate, draw, abort, etc) so we calculate accuracies/win rate correctly
    if (!record.winner) {
      continue;
    }

    const opening = parseOpeningName(record.opening.name);

    let openingStats = openingsStats.find(anOpening => anOpening.name === opening.name);
    if (openingStats === undefined) {
      openingStats = {
        name: opening.name,
        accuracies: [],
        wins: [],
        variations: []
      }
      openingsStats.push(openingStats);
    }

    let variationStats = openingsStats.find(opening => opening.name).variations.find(variation => variation.name === opening.variationName);
    if (variationStats === undefined) {
      variationStats = {
        name: opening.variationName,
        accuracies: [],
        wins: []
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

    const win = colour === record.winner;
    openingStats.wins.push(win);
    if (opening.variationName) {
      variationStats.wins.push(win);
    }
  }

  const sortOpeningsByNumberOfGamesDesc = (a, b) => b.insights.numberOfGames - a.insights.numberOfGames;
  const calculateWinRate = wins => wins.filter(Boolean).length / wins.length;
  const calculateAccuracy = accuracies => accuracies.length === 0
      ? undefined
      : accuracies.reduce((prev, next) => prev + next, 0) / accuracies.length

  return openingsStats
    .filter(openingStats => openingStats.wins.length > 1) // showing a game which has only been played once does not provide useful insights
    .map(openingStats => ({
      name: openingStats.name,
      insights: {
        numberOfGames: openingStats.wins.length,
        winRate: calculateWinRate(openingStats.wins),
        accuracy: calculateAccuracy(openingStats.accuracies)
      },
      variations: openingStats.variations
        .map(variation => ({
          name: variation.name,
          insights: {
            numberOfGames: variation.wins.length,
            winRate: calculateWinRate(variation.wins),
            accuracy: calculateAccuracy(variation.accuracies)
          }
        }))
        .sort(sortOpeningsByNumberOfGamesDesc)
    }))
    .sort(sortOpeningsByNumberOfGamesDesc)
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