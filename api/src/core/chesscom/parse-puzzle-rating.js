import { chesscomDateToString } from "./utils.js";

export function parsePuzzleRating({ tactics }) {
  const { lowest, highest } = tactics;
  const latest = highest.date > lowest.date ? highest : lowest;

  return {
    date: chesscomDateToString(latest.date),
    value: latest.rating,
  };
}
