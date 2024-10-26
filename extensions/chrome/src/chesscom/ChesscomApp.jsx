export default function ChesscomApp({ port, gameInfo }) {
  return <pre style={{ color: "white", textWrap: "wrap", fontSize: "14px" }}>{JSON.stringify(gameInfo, null, 2)}</pre>;
}
