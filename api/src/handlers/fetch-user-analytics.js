import { fetchLichessUserGames } from "../core/lichess/user/export-games.js";
import { fetchLichessUserPerformanceStatistics } from "../core/lichess/user/performance-statistics.js";
import corsHeaders from "./cors-headers.js";
import { fetchLichessUserRatingHistory } from "../core/lichess/user/user-rating-history.js";

export async function fetchUserAnalytics(event) {
  console.log(`Request received: ${JSON.stringify(event.queryStringParameters)}`);

  const { platform, username, colour, gameType } = event.queryStringParameters;

  if (platform !== "lichess") {
    return { statusCode: 501 };
  }

  const [games, performance, latestPuzzleRating] = await Promise.all([
    fetchLichessUserGames(username, gameType, colour),
    fetchLichessUserPerformanceStatistics(username, gameType),
    fetchLichessUserRatingHistory(username, "Puzzles"),
  ]);

  if (!games || !performance) {
    return {
      statusCode: 404,
      headers: corsHeaders,
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ performance, games, latestPuzzleRating }),
    headers: corsHeaders,
  };
}
