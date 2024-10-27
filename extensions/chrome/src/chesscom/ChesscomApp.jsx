import React, { useState } from "react";
import "./ChesscomApp.css";
import logo from "@/logo_128x128.png";
import useChesscomData from "@/chesscom/useChesscomData.js";
import StatsChartComponent from "@/shared/components/StatsChartComponent.jsx";
import MoveTimesChartComponent from "@/shared/components/MoveTimesChartComponent.jsx";
import OpeningsChartComponent from "@/shared/components/OpeningsChartComponent.jsx";
import ChesscomPageStylesWrapper from "@/chesscom/ChesscomPageStylesWrapper.jsx";
import EloRangeComponent from "@/shared/components/EloRangeComponent.jsx";
import { DisconnectIcon, PuzzleIcon } from "@/shared/components/Icons.jsx";
import OpponentNotesComponent from "@/shared/components/OpponentNotesComponent.jsx";
import PuzzleRating from "@/shared/components/PuzzleRating.jsx";
import Disconnects from "@/shared/components/Disconnects.jsx";
import Streak from "@/shared/components/Streak.jsx";

export default function ChesscomApp({ port, gameInfo }) {
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [opponentNotes, setOpponentNotes] = useState(null);
  const [error, setError] = useState(null);

  useChesscomData({ gameInfo, setUserAnalytics, setError });

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
                <PuzzleRating userAnalytics={userAnalytics} />
              </div>
              <div className="ca_opponent_info_section" title="Disconnects">
                <DisconnectIcon width="16" height="16" />
                <Disconnects userAnalytics={userAnalytics} />
              </div>
              <div className="ca_opponent_info_section" title="Streak">
                <span className={`icon-font-chess ${gameInfo.gameType} tabs-icon`} style={{ fontSize: "16px" }}></span>
                <Streak userAnalytics={userAnalytics} />
              </div>
            </div>
            <StatsChartComponent isLoading={userAnalytics === null} userAnalytics={userAnalytics} height={100} />
            <OpeningsChartComponent isLoading={userAnalytics === null} userAnalytics={userAnalytics} />
            <MoveTimesChartComponent isLoading={userAnalytics === null} userAnalytics={userAnalytics} height={100} />
            <OpponentNotesComponent
              shouldInit={true}
              user={gameInfo.user}
              opponent={gameInfo.opponent}
              setError={setError}
              opponentNotes={opponentNotes}
              setOpponentNotes={setOpponentNotes}
            />
          </div>
        </ChesscomPageStylesWrapper>
      </div>
    </div>
  );
}
