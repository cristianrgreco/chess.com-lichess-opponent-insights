export function extractOpponentMoveTimes(clocks, opponentColour) {
  const opponentMoveTimes = [];
  for (let i = opponentColour === "white" ? 0 : 1; i < clocks.length; i += 2) {
    opponentMoveTimes.push(clocks[i]);
  }
  return opponentMoveTimes;
}

export function convertMoveTimesToSeconds(moveTimes) {
  return moveTimes.map((moveTime) => moveTime / 100);
}

export function calculateMoveTimeDurations(moveTimes) {
  const sortedMoveTimes = [...moveTimes];
  sortedMoveTimes.sort((a, b) => b - a);

  const moveTimeDurations = [];

  for (let i = 0; i < sortedMoveTimes.length - 1; i++) {
    const current = sortedMoveTimes[i];
    const next = sortedMoveTimes[i + 1];
    const duration = current - next;
    moveTimeDurations.push([current, duration]);
  }

  return moveTimeDurations;
}
