import fetch from "node-fetch";
import { PAT } from "../../../conf";

export async function fetchLichessUserPerformanceStatistics(username, gameType) {
  const headers = { Authorization: `Bearer ${PAT}` };
  const response = await fetch(`https://lichess.org/api/user/${username}/perf/${gameType}`, { headers });

  if (response.status !== 200) {
    console.log(`Lichess response code: ${response.status}`);
    try {
      console.log(`Lichess response body: ${await response.text()}`);
    } catch {
      console.log("Could not log Lichess response body");
    }
    return;
  }

  const responseJson = await response.json();

  return {
    lowestRating: responseJson.stat.lowest?.int,
    lowestRatingDateTime: responseJson.stat.lowest?.at,
    highestRating: responseJson.stat.highest?.int,
    highestRatingDateTime: responseJson.stat.highest?.at,
    currentRating: responseJson.perf.glicko.rating,
    totalNumberOfGames: responseJson.stat.count.all,
    totalNumberOfDisconnects: responseJson.stat.count.disconnects,
    currentLosingStreak: responseJson.stat.resultStreak.loss.cur.v,
    currentWinningStreak: responseJson.stat.resultStreak.win.cur.v,
    tilt: responseJson.stat.resultStreak.loss.cur.v >= 3,
  };
}
