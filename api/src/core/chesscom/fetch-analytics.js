import fetch from "node-fetch";
import { parsePerformance } from "./parse-performance.js";
import { parsePuzzleRating } from "./parse-puzzle-rating.js";

export async function fetchAnalytics(username, gameType, colour) {
  const statsResponse = await fetch(`https://api.chess.com/pub/player/${username}/stats`);
  const statsResponseJson = await statsResponse.json();

  return {
    performance: parsePerformance(statsResponseJson, gameType),
    latestPuzzleRating: parsePuzzleRating(statsResponseJson),
  };
}
