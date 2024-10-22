import { parsePuzzleRating } from "@/core/chesscom/parse-puzzle-rating.js";

test("should parse puzzle rating", () => {
  const input = {
    tactics: {
      highest: {
        rating: 570,
        date: 1656235930,
      },
      lowest: {
        rating: 412,
        date: 1613765585,
      },
    },
  };
  expect(parsePuzzleRating(input)).toEqual({
    date: "2022-06-26T09:32:10.000Z",
    value: 570,
  });
});
