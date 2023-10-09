const {fetchLichessUserGames} = require("../core/lichess/user/export-games");
const {fetchLichessUserPerformanceStatistics} = require("../core/lichess/user/performance-statistics");
const corsHeaders = require("./cors-headers");
const {fetchLichessUserRatingHistory} = require("../core/lichess/user/user-rating-history");

async function fetchUserAnalytics(event) {
  console.log(`Request received: ${JSON.stringify(event.queryStringParameters)}`);

  const {platform, username, colour, gameType} = event.queryStringParameters;

  if (platform !== "lichess") {
    return {statusCode: 501};
  }

  const games = await fetchLichessUserGames(username, gameType, colour);
  const performance = await fetchLichessUserPerformanceStatistics(username, gameType);
  const latestPuzzleRating = await fetchLichessUserRatingHistory(username, "Puzzles");
  if (!games || !performance) {
    return {
      statusCode: 404,
      headers: corsHeaders
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ performance, games, latestPuzzleRating }),
    headers: corsHeaders
  };
}

module.exports = {
  handler: fetchUserAnalytics
}