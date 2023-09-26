const fetch = require("node-fetch");

async function fetchLichessUserPerformanceStatistics(username, gameType) {
  const response = await fetch(`https://lichess.org/api/user/${username}/perf/${gameType}`);
  const responseJson = await response.json();

  const customStats = {
    isTilt: responseJson.stat.resultStreak.loss.cur.v >= 3
  };

  return { _raw: responseJson, ...customStats }
}

module.exports = {
  fetchLichessUserPerformanceStatistics
};