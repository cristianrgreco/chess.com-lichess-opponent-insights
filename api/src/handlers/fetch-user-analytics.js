import { fetchLichessUserGames } from "../core/lichess/user/export-games";
import { fetchLichessUserPerformanceStatistics } from "../core/lichess/user/performance-statistics";
import corsHeaders from "./cors-headers";
import { fetchLichessUserRatingHistory } from "../core/lichess/user/user-rating-history";

export async function fetchUserAnalytics(event) {
  console.log(`Request received: ${JSON.stringify(event.queryStringParameters)}`);

  const { platform, username, colour, gameType } = event.queryStringParameters;

  if (platform !== "lichess") {
    return { statusCode: 501 };
  }

  const games = await fetchLichessUserGames(username, gameType, colour);
  const performance = await fetchLichessUserPerformanceStatistics(username, gameType);
  const latestPuzzleRating = await fetchLichessUserRatingHistory(username, "Puzzles");
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
