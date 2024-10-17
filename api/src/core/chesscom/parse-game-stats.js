import { flipColour } from "./utils.js";

export function parseGameStats(games, opponentColour) {
  const numberOfGames = games.length;

  const win = {
    mateRate: games.filter((game) => game[opponentColour].result === "win").length / numberOfGames,
    resignRate: games.filter((game) => game[opponentColour].result === "resigned").length / numberOfGames,
    outOfTimeRate: games.filter((game) => game[opponentColour].result === "timeout").length / numberOfGames,
  };

  const opponentRivalColour = flipColour(opponentColour);
  const lose = {
    mateRate: games.filter((game) => game[opponentRivalColour].result === "win").length / numberOfGames,
    resignRate: games.filter((game) => game[opponentRivalColour].result === "resigned").length / numberOfGames,
    outOfTimeRate: games.filter((game) => game[opponentRivalColour].result === "timeout").length / numberOfGames,
  };

  return {
    numberOfGames,
    win,
    lose,
  };
}
