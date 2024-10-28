import { useEffect, useState } from "react";
import "chart.js/auto";
import "./LichessApp.css";
import Tab from "@/lichess/components/presentational/Tab";
import AuthWrapper from "@/lichess/components/presentational/AuthWrapper.jsx";
import { GAME_TYPES } from "@/shared/constants.js";
import {
  api,
  PageStylesContext,
  EloRange,
  StatsChart,
  OpeningsChart,
  MoveTimesChart,
  DisconnectIcon,
  NotesIcon,
  PuzzleIcon,
  ErrorBar,
  OpponentNotesContainer,
  PuzzleRating,
  Streak,
  Disconnects,
} from "@/shared";

export default function LichessApp({ port, gameInfo }) {
  const [currentTab, setCurrentTab] = useState("STATS");
  const [accessToken, setAccessToken] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [opponentNotes, setOpponentNotes] = useState(null);
  const [error, setError] = useState(null);

  const style = getComputedStyle(document.body);
  const fontColour = style.getPropertyValue("--color");
  const successColour = style.getPropertyValue("--success");
  const errorColour = style.getPropertyValue("--error");

  useEffect(() => {
    function listener(message) {
      switch (message.action) {
        case "GET_LICHESS_ACCESS_TOKEN":
          if (message.payload) {
            console.log("Found access token");
            setAccessToken(message.payload.value);
          } else {
            console.log("Access token not found");
            setAccessToken(undefined);
          }
          break;
        case "AUTH_LICHESS":
          setAccessToken(message.payload.value);
          break;
        case "GET_PREFERENCES":
          onPreferences(message.payload);
          break;
        default:
          console.log(`Unhandled message received: ${message.action}`);
      }
    }

    console.log("Adding listener to port");
    port.onMessage.addListener(listener);

    console.log("Fetching access token");
    port.postMessage({ action: "GET_LICHESS_ACCESS_TOKEN" });

    return () => {
      console.log("Removing listener from port");
      port.onMessage.removeListener(listener);
    };
  }, []);

  useEffect(() => {
    const abortController = new AbortController();

    function fetchUserAnalytics() {
      console.log("Fetching user analytics");
      api
        .fetchUserAnalytics(
          "lichess",
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

    if (accessToken) {
      console.log("Fetching preferences");
      port.postMessage({ action: "GET_PREFERENCES" });
      fetchUserAnalytics();
    }

    return () => {
      console.log("Aborting fetching user analytics");
      abortController.abort();
    };
  }, [accessToken]);

  function onClickAuthorise() {
    port.postMessage({ action: "AUTH_LICHESS", payload: { user: gameInfo.user } });
  }

  function onPreferences(preferences) {
    if (preferences) {
      console.log(`Setting current tab from preferences: ${preferences.currentTab}`);
      setCurrentTab(preferences.currentTab);
    } else {
      console.log("Preferences not found");
    }
  }

  function setAndSaveCurrentTab(currentTab) {
    setCurrentTab(currentTab);
    console.log("Saving preferences");
    port.postMessage({ action: "SAVE_PREFERENCES", payload: { currentTab } });
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
