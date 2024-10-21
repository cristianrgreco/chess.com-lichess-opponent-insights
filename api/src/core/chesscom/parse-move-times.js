export function parseMoveTimes(games, colour) {
  return games.map((game) => {
    const moveTimes = parseMoveTimesFromPgn(game.pgn);
    const moveTimesForColour = extractMoveTimesForColour(moveTimes, colour);
    const moveTimesInSeconds = convertMoveTimesToSeconds(moveTimesForColour);

    return calculateMoveTimeDurations(moveTimesInSeconds);
  });
}

export function parseMoveTimesFromPgn(pgn) {
  const pgnLines = pgn.split("\n");
  const moves = pgnLines[pgnLines.length - 2];

  const regex = /\[%clk (\d+:\d{2}:\d{2}(?:\.\d{1,2})?)\]/g;

  const matches = [];
  let match;
  while ((match = regex.exec(moves)) !== null) {
    matches.push(match[1]);
  }

  return matches;
}

export function extractMoveTimesForColour(moveTimes, colour) {
  const opponentMoveTimes = [];
  for (let i = 0; i < moveTimes.length; i++) {
    if (i % 2 === (colour === "white" ? 0 : 1)) {
      opponentMoveTimes.push(moveTimes[i]);
    }
  }
  return opponentMoveTimes;
}

export function convertMoveTimesToSeconds(moveTimes) {
  return moveTimes.map((moveTime) => {
    const [hours, minutes, seconds] = moveTime.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  });
}

export function calculateMoveTimeDurations(moveTimesInSeconds) {
  const durations = [];
  for (let i = 0; i < moveTimesInSeconds.length - 1; i++) {
    const duration = moveTimesInSeconds[i] - moveTimesInSeconds[i + 1];
    durations.push([moveTimesInSeconds[i], duration]);
  }
  return durations;
}
