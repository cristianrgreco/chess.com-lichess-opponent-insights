const fetch = require("node-fetch");

async function fetchLichessUserPerformanceStatistics(username, gameType) {
  const response = await fetch(`https://lichess.org/api/user/${username}/perf/${gameType}`);
  const responseJson = await response.json();

  return {
    lowestRating: responseJson.stat.lowest?.int,
    highestRating: responseJson.stat.highest?.int,
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