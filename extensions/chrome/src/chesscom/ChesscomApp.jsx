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
import ErrorComponent from "@/shared/components/ErrorComponent.jsx";

export default function ChesscomApp({ port, gameInfo }) {
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [opponentNotes, setOpponentNotes] = useState(null);
  const [error, setError] = useState(null);

  useChesscomData({ gameInfo, setUserAnalytics, setError });

  return (
    <React.Fragment>
      {error ? <ErrorComponent error={error} /> : null}
      <div className="ca_chesscom">
        <ChesscomPageStylesWrapper>
          <div className="ca_chesscom__header">
            <img alt="Logo" src={chrome.runtime.getURL(logo)} />
            <h1 style={{ color: "var(--color)" }}>Chess Insights</h1>
          </div>
          <div className="ca_chesscom__summary">
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
          <div className="ca_chesscom__opponent-notes">
            <OpponentNotesComponent
              shouldInit={true}
              gameInfo={gameInfo}
              setError={setError}
              opponentNotes={opponentNotes}
              setOpponentNotes={setOpponentNotes}
            />
          </div>
        </ChesscomPageStylesWrapper>
      </div>
    </React.Fragment>
  );
}
