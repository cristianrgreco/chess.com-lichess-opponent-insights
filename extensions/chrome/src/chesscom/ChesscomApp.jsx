import { useEffect, useState } from "react";
import * as api from "@/api.js";

export default function ChesscomApp({ port, gameInfo }) {
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserAnalytics();
  }, [gameInfo]);

  function fetchUserAnalytics() {
    console.log("Fetching user analytics");
    setUserAnalytics(null);
    api
      .fetchUserAnalytics("chesscom", gameInfo.opponent, gameInfo.opponentColour, gameInfo.gameType)
      .then((response) => {
        console.log("Fetched user analytics");
        setUserAnalytics(response);
      })
      .catch((response) => setError("Failed to fetch user analytics."));
  }

  return (
    <pre style={{ color: "white", textWrap: "nowrap", fontSize: "10px", maxHeight: "768px", overflow: "scroll" }}>
      GAME INFO
      {"\n"}
      {JSON.stringify(gameInfo, null, 2)}
      {"\n\n"}
      USER ANALYTICS
      {"\n"}
      {JSON.stringify(userAnalytics, null, 2)}
    </pre>
  );
}
