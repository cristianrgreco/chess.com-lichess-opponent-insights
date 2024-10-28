import { useEffect, useState } from "react";
import { api } from "@/shared";

export default function useChesscomData({ gameInfo, setError }) {
  const [userAnalytics, setUserAnalytics] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();

    function fetchUserAnalytics() {
      console.log("Fetching user analytics");
      setUserAnalytics(null);
      api
        .fetchUserAnalytics(
          "chesscom",
          gameInfo.opponent,
          gameInfo.opponentColour,
          gameInfo.gameType,
          null,
          abortController.signal,
        )
        .then((response) => {
          console.log("Fetched user analytics");
          setUserAnalytics(response);
        })
        .catch(() => {
          if (!abortController.signal.aborted) {
            setError("Failed to fetch user analytics.");
          }
        });
    }

    fetchUserAnalytics();

    return () => {
      console.log("Aborting fetching user analytics");
      abortController.abort();
    };
  }, [gameInfo]);

  return userAnalytics;
}
