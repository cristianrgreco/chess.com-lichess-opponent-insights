import React, { useEffect, useState } from "react";
import "./ChesscomApp.css";
import * as api from "@/shared/api.js";
import StatsChartComponent from "@/shared/components/StatsChartComponent.jsx";
import MoveTimesChartComponent from "@/shared/components/MoveTimesChartComponent.jsx";
import OpeningsChartComponent from "@/shared/components/OpeningsChartComponent.jsx";
import ChesscomPageStylesWrapper from "@/chesscom/ChesscomPageStylesWrapper.jsx";
import DebugOutput from "@/chesscom/DebugOutput.jsx";

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
    <React.Fragment>
      <DebugOutput gameInfo={gameInfo} userAnalytics={userAnalytics} />
      <ChesscomPageStylesWrapper>
        <StatsChartComponent isLoading={userAnalytics === null} userAnalytics={userAnalytics} />
        <OpeningsChartComponent isLoading={userAnalytics === null} userAnalytics={userAnalytics} />
        <MoveTimesChartComponent isLoading={userAnalytics === null} userAnalytics={userAnalytics} />
      </ChesscomPageStylesWrapper>
    </React.Fragment>
  );
}
