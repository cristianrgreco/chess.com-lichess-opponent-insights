import { useEffect, useState } from "react";
import * as api from "@/shared/api.js";
import "./LichessApp.css";
import "chart.js/auto";
import PageStylesContext from "@/shared/PageStylesContext.js";
import EloRangeComponent from "@/shared/components/EloRangeComponent";
import StatsChartComponent from "@/shared/components/StatsChartComponent";
import OpeningsChartComponent from "@/shared/components/OpeningsChartComponent";
import MoveTimesChartComponent from "@/shared/components/MoveTimesChartComponent";
import { DisconnectIcon, NotesIcon, PuzzleIcon } from "@/shared/components/Icons";
import ErrorComponent from "@/shared/components/ErrorComponent";
import OpponentNotesComponent from "@/shared/components/OpponentNotesComponent";
import Tab from "@/lichess/components/Tab";
import AuthWrapper from "@/lichess/components/AuthWrapper.jsx";
import { GAME_TYPES } from "@/shared/constants.js";
import PuzzleRating from "@/shared/components/PuzzleRating.jsx";
import Streak from "@/shared/components/Streak.jsx";
import Disconnects from "@/shared/components/Disconnects.jsx";

export default function LichessApp({ port, gameInfo: { user, opponent, opponentColour, gameType } }) {
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
    if (accessToken) {
      console.log("Fetching preferences");
      port.postMessage({ action: "GET_PREFERENCES" });
      fetchUserAnalytics();
    }
  }, [accessToken]);

  function onClickAuthorise() {
    port.postMessage({ action: "AUTH_LICHESS", payload: { user } });
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

  function fetchUserAnalytics() {
    console.log("Fetching user analytics");
    api
      .fetchUserAnalytics("lichess", opponent, opponentColour, gameType, accessToken)
      .then((response) => {
        console.log("Fetched user analytics");
        setUserAnalytics(response);
      })
      .catch((response) => setError("Failed to fetch user analytics."));
  }

  if (!GAME_TYPES.has(gameType)) {
    console.log(`Skipping unsupported game type ${gameType}`);
    return null;
  }

  return (
    <div className="ca_container_root">
      {error ? <ErrorComponent error={error} /> : null}
      <AuthWrapper accessToken={accessToken} onClickAuthorise={onClickAuthorise}>
        <PageStylesContext.Provider value={{ fontColour, successColour, errorColour }}>
          <div className="ca_container">
            <div className="ca_section ca_opponent_info">
              <EloRangeComponent isLoading={!userAnalytics} userAnalytics={userAnalytics} />
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
              <StatsChartComponent isLoading={!userAnalytics} userAnalytics={userAnalytics} />
              <MoveTimesChartComponent isLoading={!userAnalytics} userAnalytics={userAnalytics} />
            </div>
            <div
              className={`ca_section ca_tab_section ca_openings ${currentTab !== "OPENINGS" ? "ca_hidden" : ""}`}
              style={{ margin: 0 }}
            >
              <OpeningsChartComponent isLoading={!userAnalytics} userAnalytics={userAnalytics} />
            </div>
            <div
              className={`ca_section ca_tab_section ca_notes ${currentTab !== "NOTES" ? "ca_hidden" : ""}`}
              style={{ margin: 0 }}
            >
              <OpponentNotesComponent
                shouldInit={accessToken !== undefined && accessToken !== null}
                user={user}
                opponent={opponent}
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
