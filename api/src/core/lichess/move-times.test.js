import { calculateMoveTimeDurations, convertMoveTimesToSeconds, extractOpponentMoveTimes } from "./move-times.js";

describe("extract opponent move times", () => {
  it("should extract move times when opponent colour is white", () => {
    const clocks = [1, 2, 3, 4];
    const opponentColour = "white";

    const opponentClocks = extractOpponentMoveTimes(clocks, opponentColour);

    expect(opponentClocks).toEqual([1, 3]);
  });

  it("should extract move times when opponent colour is black", () => {
    const clocks = [1, 2, 3, 4];
    const opponentColour = "black";

    const opponentClocks = extractOpponentMoveTimes(clocks, opponentColour);

    expect(opponentClocks).toEqual([2, 4]);
  });
});

it("should convert move times from centiseconds to seconds", () => {
  const moveTimes = [103, 203, 303];

  const moveTimesSeconds = convertMoveTimesToSeconds(moveTimes);

  expect(moveTimesSeconds).toEqual([1.03, 2.03, 3.03]);
});

describe("calculate move time durations", () => {
  it("should return empty list when no move times", () => {
    const moveTimes = [];

    const moveTimeDurations = calculateMoveTimeDurations(moveTimes);

    expect(moveTimeDurations).toEqual([]);
  });

  it("should return durations between move times", () => {
    const moveTimes = [300, 299];

    const moveTimeDurations = calculateMoveTimeDurations(moveTimes);

    expect(moveTimeDurations).toEqual([[300, 1]]);
  });

  it("should return correct durations when move times provided in ascending order", () => {
    const moveTimes = [299, 300];

    const moveTimeDurations = calculateMoveTimeDurations(moveTimes);

    expect(moveTimeDurations).toEqual([[300, 1]]);
  });
});
