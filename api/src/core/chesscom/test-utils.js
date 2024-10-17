import { flipColour } from "./utils.js";

export const TEST_TIMESTAMP = 1704067200;
export const TEST_OPENING = "Queens-Pawn-Opening-Mikenas-Defense-2.d5-Ne5";

export function createGame(
  gameResult,
  gameType,
  opponentColour,
  endTime = TEST_TIMESTAMP,
  opening = TEST_OPENING,
  opponentRivalGameResult = "abandoned",
) {
  return {
    time_class: gameType,
    [flipColour(opponentColour)]: {
      rating: 1240,
      result: opponentRivalGameResult,
      username: "myself",
    },
    [opponentColour]: {
      rating: 1250,
      result: gameResult,
      username: "opponent",
    },
    end_time: endTime,
    eco: `https://www.chess.com/openings/${opening}`,
  };
}
