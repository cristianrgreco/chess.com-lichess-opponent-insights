import fetch from "node-fetch";

export async function fetchLichessUserRatingHistory(authorisation, username, ratingType) {
  const headers = { Authorization: authorisation };
  const response = await fetch(`https://lichess.org/api/user/${username}/rating-history`, { headers });

  if (response.status !== 200) {
    console.log(`Lichess response code: ${response.status}`);
    try {
      console.log(`Lichess response body: ${await response.text()}`);
    } catch {
      console.log("Could not log Lichess response body");
    }
    return;
  }

  try {
    const responseJson = await response.json();
    const ratingHistory = responseJson.find((r) => r.name === ratingType);
    if (ratingHistory) {
      const latestRatingHistory = ratingHistory.points[ratingHistory.points.length - 1];
      const historyDate = new Date(`${latestRatingHistory[0]}, ${latestRatingHistory[1]}, ${latestRatingHistory[2]}`);
      const historyValue = latestRatingHistory[3];
      return { date: historyDate, value: historyValue };
    }
    return {};
  } catch {
    return {};
  }
}
