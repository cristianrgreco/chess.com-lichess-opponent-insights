import fetch from "node-fetch";

export async function fetchGames(numberOfGames, username, gameType, colour) {
  const gameArchivesResponse = await fetch(`https://api.chess.com/pub/player/${username}/games/archives`);
  const gameArchivesResponseJson = await gameArchivesResponse.json();

  const games = [];

  if (!gameArchivesResponseJson.archives) {
    return games;
  }

  for (let i = gameArchivesResponseJson.archives.length - 1; i >= 0 && games.length < numberOfGames; i--) {
    const gamesResponse = await fetch(gameArchivesResponseJson.archives[i]);
    const gamesResponseJson = await gamesResponse.json();

    const remainingGames = numberOfGames - games.length;

    const gamesToAdd = (gamesResponseJson.games ?? [])
      .filter((aGame) => {
        const opponentColour = aGame["white"]["username"].toLowerCase() === username.toLowerCase() ? "white" : "black";
        return aGame["time_class"] === gameType && opponentColour === colour;
      })
      .slice(-remainingGames);

    games.push(...gamesToAdd);
  }

  const sortByEndTimeDesc = (a, b) => b["end_time"] - a["end_time"];
  games.sort(sortByEndTimeDesc);

  return games;
}
