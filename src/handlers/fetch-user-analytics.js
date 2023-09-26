const {fetchLichessUserGames} = require("../core/lichess/user/export-games");
const {fetchLichessUserPerformanceStatistics} = require("../core/lichess/user/performance-statistics");

async function fetchUserAnalytics(event) {
  const {platform, username, colour, perf} = event.queryStringParameters;

  if (platform !== "lichess") {
    return {statusCode: 501};
  }

  const [games, userPerformanceStatistics] = await Promise.all([
    fetchLichessUserGames(username, perf, colour),
    fetchLichessUserPerformanceStatistics(username, perf)
  ]);

  return {
    statusCode: 200,
    body: JSON.stringify({ games, userPerformanceStatistics })
  };
}

module.exports = {
  handler: fetchUserAnalytics
}