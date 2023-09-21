const fetch = require("node-fetch");
const ndjson = require('ndjson')
const {PAT} = require("../conf");

async function fetchUserGames(username, perf, colour) {
  const numberOfGames = 60;

  const params = new URLSearchParams({
    max: numberOfGames,
    rated: true,
    perfType: perf,
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
  const responseText = await response.text();

  const ndjsonParser = ndjson.parse();
  ndjsonParser.write(responseText);

  const openingsStats = {};
  let iterationCount = 0;

  for await (const record of ndjsonParser) {
    iterationCount++;
    if (iterationCount === numberOfGames) {
      break;
    }

    const opening = record.opening.name;

    if (!openingsStats[opening]) {
      openingsStats[opening] = {
        accuracies: [],
        wins: [],
      };
    }

    const accuracy = record.players[colour].analysis?.accuracy;
    if (accuracy) {
      openingsStats[opening].accuracies.push(accuracy);
    }

    const win = colour === record.winner;
    openingsStats[opening].wins.push(win);
  }

  const openings = Object.entries(openingsStats).reduce((result, record) => {
    const [opening, { accuracies, wins }] = record;
    const winRate = wins.filter(Boolean).length / wins.length;
    const numberOfGames = wins.length;
    const accuracy = accuracies.length === 0 ? undefined : accuracies.reduce((prev, next) => prev + next, 0) / accuracies.length;

    return {
      ...result,
      [opening]: {
        winRate,
        numberOfGames,
        accuracy
      }
    };
  }, {});

  return { openings };
}

module.exports = {
  fetchUserGames
};