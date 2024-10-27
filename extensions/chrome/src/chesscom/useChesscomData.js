import { useEffect } from "react";
import { api } from "@/shared";

export default function useChesscomData({ gameInfo, setUserAnalytics, setError }) {
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
}
