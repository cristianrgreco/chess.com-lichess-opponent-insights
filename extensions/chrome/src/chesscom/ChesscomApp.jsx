import React, { useState } from "react";
import "./ChesscomApp.css";
import logo from "@/logo_128x128.png";
import {
  PageStylesWrapper,
  useUserAnalyticsData,
  StatsChart,
  MoveTimesChart,
  OpeningsChart,
  EloRange,
  DisconnectIcon,
  PuzzleIcon,
  OpponentNotesContainer,
  PuzzleRating,
  Disconnects,
  Streak,
  ErrorBar,
} from "@/shared";

export default function ChesscomApp({ port, gameInfo }) {
  const [opponentNotes, setOpponentNotes] = useState(null);
  const [error, setError] = useState(null);

  const userAnalytics = useUserAnalyticsData({ platform: "chesscom", gameInfo, setError });

  return (
    <PageStylesWrapper>
      {error ? <ErrorBar error={error} /> : null}
      <div className="ca_chesscom">
        <div className="ca_chesscom__header">
          <img alt="Logo" src={chrome.runtime.getURL(logo)} />
          <h1 className="ca_chesscom__header-title">Chess Insights</h1>
        </div>
        <div className="ca_chesscom__summary">
          <EloRange isLoading={!userAnalytics} userAnalytics={userAnalytics} />
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
        <StatsChart isLoading={userAnalytics === null} userAnalytics={userAnalytics} height={100} />
        <OpeningsChart isLoading={userAnalytics === null} userAnalytics={userAnalytics} />
        <MoveTimesChart isLoading={userAnalytics === null} userAnalytics={userAnalytics} height={100} />
        <div className="ca_chesscom__opponent-notes">
          <OpponentNotesContainer
            shouldInit={true}
            gameInfo={gameInfo}
            setError={setError}
            opponentNotes={opponentNotes}
            setOpponentNotes={setOpponentNotes}
          />
        </div>
      </div>
    </PageStylesWrapper>
  );
}
