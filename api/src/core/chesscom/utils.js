export function flipColour(colour) {
  return colour === "white" ? "black" : "white";
}

export function chesscomDateToString(date) {
  return new Date(date * 1000).toISOString();
}
