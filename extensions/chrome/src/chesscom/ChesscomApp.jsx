import React, { useEffect, useState } from "react";
import "./ChesscomApp.css";
import * as api from "@/shared/api.js";
import StatsChartComponent from "@/shared/components/StatsChartComponent.jsx";
import MoveTimesChartComponent from "@/shared/components/MoveTimesChartComponent.jsx";
import OpeningsChartComponent from "@/shared/components/OpeningsChartComponent.jsx";
import PageStylesContext from "@/shared/PageStylesContext.js";

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

  const style = getComputedStyle(document.body);
  const fontColour = style.getPropertyValue("--nodeColor");
  const successColour = style.getPropertyValue("--color-bg-win");
  const errorColour = style.getPropertyValue("--color-classification-miss");

  return (
    <React.Fragment>
      <pre style={{ color: "white", textWrap: "nowrap", fontSize: "10px", maxHeight: "768px", overflow: "scroll" }}>
        GAME INFO
        {"\n"}
        {JSON.stringify(gameInfo, null, 2)}
        {"\n\n"}
        USER ANALYTICS
        {"\n"}
        {JSON.stringify(userAnalytics)}
      </pre>
      <PageStylesContext.Provider value={{ fontColour, successColour, errorColour }}>
        <StatsChartComponent isLoading={userAnalytics === null} userAnalytics={userAnalytics} />
        <OpeningsChartComponent isLoading={userAnalytics === null} userAnalytics={userAnalytics} />
        <MoveTimesChartComponent isLoading={userAnalytics === null} userAnalytics={userAnalytics} />
      </PageStylesContext.Provider>
    </React.Fragment>
  );
}
