import React, { useState } from "react";
import "./ChesscomApp.css";
import useChesscomData from "@/chesscom/useChesscomData.js";
import StatsChartComponent from "@/shared/components/StatsChartComponent.jsx";
import MoveTimesChartComponent from "@/shared/components/MoveTimesChartComponent.jsx";
import OpeningsChartComponent from "@/shared/components/OpeningsChartComponent.jsx";
import ChesscomPageStylesWrapper from "@/chesscom/ChesscomPageStylesWrapper.jsx";
import EloRangeComponent from "@/shared/components/EloRangeComponent.jsx";
import logo from "@/logo_128x128.png";
import { DisconnectIcon, PuzzleIcon } from "@/shared/components/Icons.jsx";

export default function ChesscomApp({ port, gameInfo }) {
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [error, setError] = useState(null);

  useChesscomData({ gameInfo, setUserAnalytics, setError });

  const placeholderClass = userAnalytics ? "" : "ca_placeholder_enabled";
  const puzzleRatingText = userAnalytics ? (userAnalytics.latestPuzzleRating?.value ?? "NA") : "????";
  const disconnectsText = userAnalytics
    ? `${((userAnalytics.performance.totalNumberOfDisconnects / userAnalytics.performance.totalNumberOfGames) * 100).toFixed(1)}%`
    : "????";
  const streakClass = userAnalytics
    ? userAnalytics.performance.currentLosingStreak > 0
      ? "ca_negative"
      : userAnalytics.performance.currentWinningStreak > 0
        ? "ca_positive"
        : ""
    : "";
  const streakText = userAnalytics
    ? userAnalytics.performance.currentLosingStreak > 0
      ? `-${userAnalytics.performance.currentLosingStreak}`
      : userAnalytics.performance.currentWinningStreak > 0
        ? `+${userAnalytics.performance.currentWinningStreak}`
        : "0"
    : "???";

  return (
    <div className="chesscom">
      <div style={{ margin: "20px 0" }}>
        <ChesscomPageStylesWrapper>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              <img src={chrome.runtime.getURL(logo)} style={{ width: "100px" }} />
              <h1 style={{ color: "var(--color)" }}>Chess Insights</h1>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "10px",
                color: "var(--color)",
              }}
            >
              <EloRangeComponent isLoading={!userAnalytics} userAnalytics={userAnalytics} />
              <div className="ca_opponent_info_section" title="Puzzle Rating">
                <PuzzleIcon width="16" height="16" />
                <span className={`ca_puzzle_rating ca_placeholder ${placeholderClass}`}>{puzzleRatingText}</span>
              </div>
              <div className="ca_opponent_info_section" title="Disconnects">
                <DisconnectIcon width="16" height="16" />
                <span className={`ca_disconnects ca_placeholder ${placeholderClass}`}>{disconnectsText}</span>
              </div>
              <div className="ca_opponent_info_section" title="Streak">
                <span className={`icon-font-chess ${gameInfo.gameType} tabs-icon`} style={{ fontSize: "16px" }}></span>
                <span className={`${streakClass} ca_win_streak_value ca_placeholder ${placeholderClass}`}>
                  {streakText}
                </span>
              </div>
            </div>
            <StatsChartComponent isLoading={userAnalytics === null} userAnalytics={userAnalytics} />
            <OpeningsChartComponent isLoading={userAnalytics === null} userAnalytics={userAnalytics} />
            <MoveTimesChartComponent isLoading={userAnalytics === null} userAnalytics={userAnalytics} height={200} />
          </div>
        </ChesscomPageStylesWrapper>
      </div>
    </div>
  );
}
