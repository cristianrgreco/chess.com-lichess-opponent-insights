import React, { useState } from "react";
import "./ChesscomApp.css";
import StatsChartComponent from "@/shared/components/StatsChartComponent.jsx";
import MoveTimesChartComponent from "@/shared/components/MoveTimesChartComponent.jsx";
import OpeningsChartComponent from "@/shared/components/OpeningsChartComponent.jsx";
import ChesscomPageStylesWrapper from "@/chesscom/ChesscomPageStylesWrapper.jsx";
import DebugOutput from "@/chesscom/DebugOutput.jsx";
import useChesscomData from "@/chesscom/useChesscomData.js";

export default function ChesscomApp({ port, gameInfo }) {
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [error, setError] = useState(null);

  useChesscomData({ gameInfo, setUserAnalytics, setError });

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
