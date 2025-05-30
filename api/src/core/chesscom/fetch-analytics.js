import fetch from "node-fetch";
import { parsePerformance } from "./parse-performance.js";
import { parsePuzzleRating } from "./parse-puzzle-rating.js";
import { fetchGames } from "./fetch-games.js";
import { parseGameStats } from "./parse-game-stats.js";
import { parseOpenings } from "./parse-openings.js";
import { parseMoveTimes } from "./parse-move-times.js";

export async function fetchAnalytics(username, gameType, colour) {
  const statsResponse = await fetch(`https://api.chess.com/pub/player/${username}/stats`);
  const statsResponseJson = await statsResponse.json();

  const games = await fetchGames(60, username, gameType, colour);

  return {
    games: {
      stats: parseGameStats(games, colour),
      openings: parseOpenings(games, colour),
      moveTimes: parseMoveTimes(games, colour),
    },
    performance: parsePerformance(statsResponseJson, games, gameType, colour),
    latestPuzzleRating: parsePuzzleRating(statsResponseJson),
  };
}
