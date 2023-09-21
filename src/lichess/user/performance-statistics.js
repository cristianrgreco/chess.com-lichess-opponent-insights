const fetch = require("node-fetch");

async function fetchUserPerformanceStatistics(username, perf) {
  const response = await fetch(`https://lichess.org/api/user/${username}/perf/${perf}`);
  const responseJson = await response.json();

  const customStats = {
    isTilt: responseJson.stat.resultStreak.loss.cur.v >= 3
  };

  return { _raw: responseJson, ...customStats }
}

module.exports = {
  fetchUserPerformanceStatistics
};