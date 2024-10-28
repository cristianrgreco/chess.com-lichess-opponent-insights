import { useEffect, useState } from "react";
import { api } from "@/shared";

export default function useUserAnalyticsData({ platform, gameInfo, setError, accessToken }) {
  const [userAnalytics, setUserAnalytics] = useState(null);

  useEffect(() => {
    if (platform === "lichess" && !accessToken) {
      console.log("Not fetching user analytics");
      return;
    }

    const abortController = new AbortController();

    function fetchUserAnalytics() {
      console.log("Fetching user analytics");
      setUserAnalytics(null);
      api
        .fetchUserAnalytics(
          platform,
          gameInfo.opponent,
          gameInfo.opponentColour,
          gameInfo.gameType,
          accessToken,
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
  }, [platform, gameInfo, accessToken]);

  return userAnalytics;
}
