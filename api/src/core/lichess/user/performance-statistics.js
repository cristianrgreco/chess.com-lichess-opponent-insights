const fetch = require("node-fetch");

async function fetchLichessUserPerformanceStatistics(username, gameType) {
  const response = await fetch(`https://lichess.org/api/user/${username}/perf/${gameType}`);

  if (response.status !== 200) {
    return;
  }

  const responseJson = await response.json();

  return {
    lowestRating: responseJson.stat.lowest?.int,
    lowestRatingDateTime: responseJson.stat.lowest?.at,
    highestRating: responseJson.stat.highest?.int,
    highestRatingDateTime: responseJson.stat.highest?.at,
    currentRating: responseJson.perf.glicko.rating,
    totalNumberOfGames: responseJson.stat.count.all,
    totalNumberOfDisconnects: responseJson.stat.count.disconnects,
    currentLosingStreak: responseJson.stat.resultStreak.loss.cur.v,
    currentWinningStreak: responseJson.stat.resultStreak.win.cur.v,
    tilt: responseJson.stat.resultStreak.loss.cur.v >= 3,
  };
}

module.exports = {
  fetchLichessUserPerformanceStatistics
};