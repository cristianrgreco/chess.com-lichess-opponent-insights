import { flipColour } from "./utils.js";

export function createGame(gameResult, gameType, opponentColour) {
  return {
    time_class: gameType,
    [flipColour(opponentColour)]: {
      rating: 1240,
      result: "abandoned",
      username: "myself",
    },
    [opponentColour]: {
      rating: 1250,
      result: gameResult,
      username: "opponent",
    },
    eco: "https://www.chess.com/openings/Queens-Pawn-Opening-Mikenas-Defense-2.d5-Ne5",
  };
}
