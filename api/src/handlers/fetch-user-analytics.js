const {fetchLichessUserGames} = require("../core/lichess/user/export-games");
const {fetchLichessUserPerformanceStatistics} = require("../core/lichess/user/performance-statistics");
const corsHeaders = require("./cors-headers");

async function fetchUserAnalytics(event) {
  console.log(`Request received: ${JSON.stringify(event.queryStringParameters)}`);

  const {platform, username, colour, gameType} = event.queryStringParameters;

  if (platform !== "lichess") {
    return {statusCode: 501};
  }

  const [games, performance] = await Promise.all([
    fetchLichessUserGames(username, gameType, colour),
    fetchLichessUserPerformanceStatistics(username, gameType)
  ]);

  if (!games || !performance) {
    return {
      statusCode: 404,
      headers: corsHeaders
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ performance, games }),
    headers: corsHeaders
  };
}

module.exports = {
  handler: fetchUserAnalytics
}