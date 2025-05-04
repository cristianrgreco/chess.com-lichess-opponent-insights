import React, { useState, useEffect } from "react";
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
  const [visible, setVisible] = useState(false);
  const [opponentNotes, setOpponentNotes] = useState(null);
  const [error, setError] = useState(null);

  const userAnalytics = useUserAnalyticsData({ platform: "chesscom", gameInfo, setError });

  useEffect(() => {
    if (userAnalytics) {
      setVisible(true);
    }
  }, [userAnalytics]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setVisible(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <PageStylesWrapper>
      {error && <ErrorBar error={error} />}
      <div className={`ca_chesscom ${visible ? "" : "ca_chesscom_invisible"}`}>
        <div
          onClick={() => setVisible(!visible)}
          className={`ca_chesscom__collapse ${visible ? "ca_chesscom__collapse-visible" : "ca_chesscom__collapse-invisible"}`}
        />
        <div className="ca_chesscom__content">
          <div className="ca_chesscom__header">
            <img className="ca_chesscom__collapse-logo" alt="Logo" src={chrome.runtime.getURL(logo)} />
            <h1 className="ca_chesscom__header-title">
              <span className="ca_chesscom__header-title-opponent-name">{gameInfo.opponent}</span>
              <span>Insights</span>
            </h1>
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
          <div className="ca_charts_container">
            <StatsChart isLoading={userAnalytics === null} userAnalytics={userAnalytics} height={100} />
            <OpeningsChart isLoading={userAnalytics === null} userAnalytics={userAnalytics} />
            <MoveTimesChart isLoading={userAnalytics === null} userAnalytics={userAnalytics} height={100} />
          </div>
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
      </div>
    </PageStylesWrapper>
  );
}
