const fetch = require("node-fetch");
const ndjson = require('ndjson')
const {PAT} = require("../../../conf");

async function fetchLichessUserGames(username, gameType, colour) {
  const numberOfGames = 60;

  const params = new URLSearchParams({
    max: numberOfGames,
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
  const responseText = await response.text();

  const ndjsonParser = ndjson.parse();
  ndjsonParser.write(responseText);

  const openingsStats = {};
  let iterationCount = 0;
  
  for await (const record of ndjsonParser) {
    if (++iterationCount === numberOfGames) {
      break;
    }

    if (!record.winner) {
      continue;
    }

    const opening = record.opening.name;
    const openingFamily = record.opening.name.split(':')[0];
    
  
    if (!openingsStats[opening]) {
      openingsStats[opening] = {
        accuracies: [],
        wins: [],
        isOpeningFamily: false,
      };
    }

    if (openingFamily !== undefined && !openingsStats[openingFamily]) {
      openingsStats[openingFamily] = {
        accuracies: [],
        wins: [],
        isOpeningFamily: true,
      };
    }

    const accuracy = record.players[colour].analysis?.accuracy;
    if (accuracy) {
      openingsStats[opening].accuracies.push(accuracy);
      if (openingFamily)
        openingsStats[openingFamily].accuracies.push(accuracy);
    }

    const win = colour === record.winner;
    openingsStats[opening].wins.push(win);

    if (openingFamily)
    openingsStats[openingFamily].wins.push(win);
  }

  const openings = Object.entries(openingsStats).reduce((result, record) => {
    const [opening, { accuracies, wins, isOpeningFamily }] = record;
    const winRate = wins.filter(Boolean).length / wins.length;
    const numberOfGames = wins.length;
    const accuracy = accuracies.length === 0 ? undefined : accuracies.reduce((prev, next) => prev + next, 0) / accuracies.length;

    return {
      ...result,
      [opening]: {
        winRate,
        numberOfGames,
        accuracy,
        isOpeningFamily
      }
    };
  }, {});

  return { openings };
}

module.exports = {
  fetchLichessUserGames
};