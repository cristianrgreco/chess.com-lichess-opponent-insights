const fetch = require("node-fetch");

async function fetchUserPerformanceStatistics(username, perf) {
  const response = await fetch(`https://lichess.org/api/user/${username}/perf/${perf}`);
  return await response.json();
}

module.exports = {
  fetchUserPerformanceStatistics
};