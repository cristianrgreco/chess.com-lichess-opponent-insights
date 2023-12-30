import { fetchLichessUserGames } from "../core/lichess/user/export-games.js";
import { fetchLichessUserPerformanceStatistics } from "../core/lichess/user/performance-statistics.js";
import corsHeaders from "./cors-headers.js";
import { fetchLichessUserRatingHistory } from "../core/lichess/user/user-rating-history.js";

export async function fetchUserAnalytics(event) {
  const authorisation = event.headers?.Authorization;
  if (!authorisation) {
    return {
      statusCode: 401,
      headers: corsHeaders,
    };
  }

  console.log(`Request received: ${JSON.stringify(event.queryStringParameters)}`);

  const { platform, username, colour, gameType } = event.queryStringParameters;

  if (platform !== "lichess") {
    return {
      statusCode: 501,
      headers: corsHeaders,
    };
  }

  const [games, performance, latestPuzzleRating] = await Promise.all([
    fetchLichessUserGames(authorisation, username, gameType, colour),
    fetchLichessUserPerformanceStatistics(authorisation, username, gameType),
    fetchLichessUserRatingHistory(authorisation, username, "Puzzles"),
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
