import { useEffect, useState } from "react";
import "chart.js/auto";
import "./LichessApp.css";
import Tab from "@/lichess/components/presentational/Tab";
import AuthWrapper from "@/lichess/components/presentational/AuthWrapper.jsx";
import useLichessAccessToken from "@/lichess/hooks/useLichessAccessToken.js";
import {
  DisconnectIcon,
  Disconnects,
  EloRange,
  ErrorBar,
  GAME_TYPES,
  MoveTimesChart,
  NotesIcon,
  OpeningsChart,
  OpponentNotesContainer,
  PageStylesContext,
  PuzzleIcon,
  PuzzleRating,
  StatsChart,
  Streak,
  usePreferences,
  useUserAnalyticsData,
} from "@/shared";

export default function LichessApp({ port, gameInfo }) {
  const [currentTab, setCurrentTab] = useState("STATS");
  const [opponentNotes, setOpponentNotes] = useState(null);
  const [error, setError] = useState(null);

  const { preferences, savePreferences } = usePreferences({ port });
  const accessToken = useLichessAccessToken({ port });
  const userAnalytics = useUserAnalyticsData({ platform: "lichess", gameInfo, accessToken, setError });

  const style = getComputedStyle(document.body);
  const fontColour = style.getPropertyValue("--color");
  const successColour = style.getPropertyValue("--success");
  const errorColour = style.getPropertyValue("--error");

  useEffect(() => {
    if (preferences) {
      console.log(`Setting current tab from preferences: ${preferences.currentTab}`);
      setCurrentTab(preferences.currentTab);
    } else {
      console.log("Preferences not found");
    }
  }, [preferences]);

  function onClickAuthorise() {
    port.postMessage({ action: "AUTH_LICHESS", payload: { user: gameInfo.user } });
  }

  function setAndSaveCurrentTab(currentTab) {
    setCurrentTab(currentTab);
    console.log("Saving preferences");
    savePreferences({ currentTab });
  }

  if (!GAME_TYPES.has(gameInfo.gameType)) {
    console.log(`Skipping unsupported game type ${gameInfo.gameType}`);
    return null;
  }

  return (
    <div className="ca_container_root">
      {error ? <ErrorBar error={error} /> : null}
      <AuthWrapper accessToken={accessToken} onClickAuthorise={onClickAuthorise}>
        <PageStylesContext.Provider value={{ fontColour, successColour, errorColour }}>
          <div className="ca_container">
            <div className="ca_section ca_opponent_info">
              <EloRange isLoading={!userAnalytics} userAnalytics={userAnalytics} />
              <div className="ca_opponent_info_sections">
                <div className="ca_opponent_info_section" title="Puzzle Rating">
                  <PuzzleIcon width="16" height="16" />
                  <PuzzleRating userAnalytics={userAnalytics} />
                </div>
                <div className="ca_opponent_info_section" title="Disconnects">
                  <DisconnectIcon width="16" height="16" />
                  <Disconnects userAnalytics={userAnalytics} />
                </div>
                <div className="ca_opponent_info_section" title="Streak">
                  <span data-icon=""></span>
                  <Streak userAnalytics={userAnalytics} />
                </div>
              </div>
            </div>
            <div className="ca_section ca_tabs">
              <Tab label="STATS" currentTab={currentTab} setCurrentTab={setAndSaveCurrentTab}>
                Stats
              </Tab>
              <Tab label="OPENINGS" currentTab={currentTab} setCurrentTab={setAndSaveCurrentTab}>
                Openings
              </Tab>
              <Tab
                label="NOTES"
                currentTab={currentTab}
                setCurrentTab={setAndSaveCurrentTab}
                additionalClasses={`ca_tab_icon ${opponentNotes ? "ca_green_colour" : ""}`}
              >
                <NotesIcon width="16" height="16" />
              </Tab>
            </div>
            <div
              className={`ca_section ca_tab_section ca_stats ${currentTab !== "STATS" ? "ca_hidden" : ""}`}
              style={{ margin: 0 }}
            >
              <StatsChart isLoading={!userAnalytics} userAnalytics={userAnalytics} />
              <MoveTimesChart isLoading={!userAnalytics} userAnalytics={userAnalytics} />
            </div>
            <div
              className={`ca_section ca_tab_section ca_openings ${currentTab !== "OPENINGS" ? "ca_hidden" : ""}`}
              style={{ margin: 0 }}
            >
              <OpeningsChart isLoading={!userAnalytics} userAnalytics={userAnalytics} />
            </div>
            <div
              className={`ca_section ca_tab_section ca_notes ${currentTab !== "NOTES" ? "ca_hidden" : ""}`}
              style={{ margin: 0 }}
            >
              <OpponentNotesContainer
                shouldInit={accessToken !== undefined && accessToken !== null}
                gameInfo={gameInfo}
                setError={setError}
                opponentNotes={opponentNotes}
                setOpponentNotes={setOpponentNotes}
              />
            </div>
          </div>
        </PageStylesContext.Provider>
      </AuthWrapper>
    </div>
  );
}
