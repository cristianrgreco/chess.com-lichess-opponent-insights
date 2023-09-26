const {fetchUserGames} = require("./export-games");
const {fetchUserPerformanceStatistics} = require("./performance-statistics");

async function handler(event) {
  const {username, colour, perf} = event.queryStringParameters;

  const [games, userPerformanceStatistics] = await Promise.all([
    fetchUserGames(username, perf, colour),
    fetchUserPerformanceStatistics(username, perf)
  ]);

  return {
    statusCode: 200,
    body: JSON.stringify({ games, userPerformanceStatistics })
  };
}

module.exports = {
  handler
}