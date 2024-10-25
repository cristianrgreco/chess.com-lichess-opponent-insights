import { useEffect, useState } from "react";
import * as api from "./api.js";
import "./LichessApp.css";
import "chart.js/auto";
import AuthComponent from "./components/AuthComponent";
import EloRangeComponent from "./components/EloRangeComponent";
import StatsChartComponent from "./components/StatsChartComponent";
import { PageStylesProvider } from "./PageStylesContext.js";
import OpeningsChartComponent from "./components/OpeningsChartComponent.jsx";
import MoveTimesChartComponent from "./components/MoveTimesChartComponent.jsx";
import { DisconnectIcon, NotesIcon, PuzzleIcon } from "@/Icons.jsx";

export default function LichessApp({ port, gameInfo: { user, opponent, opponentColour, gameType } }) {
  const [currentTab, setCurrentTab] = useState("STATS");
  const [accessToken, setAccessToken] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [opponentNotes, setOpponentNotes] = useState(null);
  const [savingOpponentNotes, setSavingOpponentNotes] = useState(false);
  const [error, setError] = useState(null);

  const style = getComputedStyle(document.body);
  const fontColour = style.getPropertyValue("--color");
  const successColour = style.getPropertyValue("--success");
  const errorColour = style.getPropertyValue("--error");

  useEffect(() => {
    port.onMessage.addListener((message) => {
      const action = actions(message)[message.action];
      if (action) {
        action();
      } else {
        console.log(`Unhandled message received: ${message.action}`);
      }
    });
    port.postMessage({ action: "GET_LICHESS_ACCESS_TOKEN" });
  }, []);

  useEffect(() => {
    if (accessToken) {
      port.postMessage({ action: "GET_PREFERENCES" });
      fetchUserAnalytics();
      fetchOpponentNotes();
    }
  }, [accessToken]);

  const actions = (message) => ({
    GET_LICHESS_ACCESS_TOKEN: () => {
      if (message.payload) {
        setAccessToken(message.payload.value);
      } else {
        setAccessToken(undefined);
      }
    },
    AUTH_LICHESS: () => {
      setAccessToken(message.payload.value);
    },
    GET_PREFERENCES: () => {
      onRetrievePreferences(message.payload);
    },
  });

  function onClickAuthoriseWithLichess() {
    port.postMessage({ action: "AUTH_LICHESS", payload: { user } });
  }

  function onSubmitSaveOpponentNotes(e) {
    e.preventDefault();
    saveOpponentNotes();
  }

  function onRetrievePreferences(preferences) {
    if (preferences) {
      console.log("Setting current tab from preferences", preferences.currentTab);
      setCurrentTab(preferences.currentTab);
    } else {
      console.log("No preferences found");
    }
  }

  function setAndSaveCurrentTab(currentTab) {
    setCurrentTab(currentTab);
    port.postMessage({ action: "SAVE_PREFERENCES", payload: { currentTab } });
  }

  function fetchUserAnalytics() {
    console.log("Fetching user analytics...");
    api
      .fetchUserAnalytics(opponent, opponentColour, gameType, accessToken)
      .then((response) => {
        console.log("Fetched user analytics");
        setUserAnalytics(response);
      })
      .catch((response) => setError("Failed to fetch user analytics."));
  }

  function fetchOpponentNotes() {
    console.log("Fetching opponent notes...");
    api
      .fetchOpponentNotes(user, opponent)
      .then((responseJson) => {
        console.log("Fetched opponent notes");
        if (responseJson.notes) {
          setOpponentNotes(responseJson.notes);
        }
      })
      .catch((response) => setError("Failed to fetch opponent notes."));
  }

  function saveOpponentNotes() {
    console.log("Saving opponent notes...");
    setSavingOpponentNotes(true);
    api
      .saveOpponentNotes(user, opponent, opponentNotes)
      .then(() => console.log("Saved opponent notes"))
      .catch((response) => setError("Failed to save opponent notes."))
      .finally(() => setSavingOpponentNotes(false));
  }

  const supportedGameTypes = ["bullet", "blitz", "rapid", "classical"];
  if (!supportedGameTypes.includes(gameType)) {
    console.log(`Unsupported game type ${gameType}. Not rendering.`);
    return null;
  }

  if (accessToken === undefined) {
    return (
      <div className="ca_container_root">
        <AuthComponent onClickAuthorise={onClickAuthoriseWithLichess} />
      </div>
    );
  }

  if (accessToken) {
    return (
      <div className="ca_container_root">
        {error ? (
          <div className="ca_error">
            <span className="ca_error_message">{error}</span>
          </div>
        ) : null}
        <div className="ca_container">
          <div className="ca_section ca_opponent_info">
            <EloRangeComponent isLoading={!userAnalytics} userAnalytics={userAnalytics} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "12px",
              }}
            >
              <div className="ca_opponent_info_section" title="Puzzle Rating">
                <PuzzleIcon width="16" height="16" />
                <span className={`ca_puzzle_rating ca_placeholder ${userAnalytics ? "" : "ca_placeholder_enabled"}`}>
                  {userAnalytics ? (userAnalytics.latestPuzzleRating?.value ?? "NA") : "????"}
                </span>
              </div>
              <div className="ca_opponent_info_section" title="Disconnects">
                <DisconnectIcon width="16" height="16" />
                <span className={`ca_disconnects ca_placeholder ${userAnalytics ? "" : "ca_placeholder_enabled"}`}>
                  {userAnalytics
                    ? `${((userAnalytics.performance.totalNumberOfDisconnects / userAnalytics.performance.totalNumberOfGames) * 100).toFixed(1)}%`
                    : "????"}
                </span>
              </div>
              <div className="ca_opponent_info_section" title="Streak">
                <span data-icon=""></span>
                <span
                  className={`${userAnalytics ? (userAnalytics.performance.currentLosingStreak > 0 ? "ca_negative" : userAnalytics.performance.currentWinningStreak > 0 ? "ca_positive" : "") : ""} ca_win_streak_value ca_placeholder ${userAnalytics ? "" : "ca_placeholder_enabled"}`}
                >
                  {userAnalytics
                    ? userAnalytics.performance.currentLosingStreak > 0
                      ? `-${userAnalytics.performance.currentLosingStreak}`
                      : userAnalytics.performance.currentWinningStreak > 0
                        ? `+${userAnalytics.performance.currentWinningStreak}`
                        : "0"
                    : "???"}
                </span>
              </div>
            </div>
          </div>
          <div className="ca_section ca_tabs">
            <span
              className={`ca_tab ca_stats_tab_trigger ${currentTab === "STATS" ? "ca_active" : ""}`}
              onClick={(e) => setAndSaveCurrentTab("STATS")}
            >
              Stats
            </span>
            <span
              className={`ca_tab ca_openings_tab_trigger ${currentTab === "OPENINGS" ? "ca_active" : ""}`}
              onClick={(e) => setAndSaveCurrentTab("OPENINGS")}
            >
              Openings
            </span>
            <span
              className={`ca_tab ca_tab_icon ca_notes_tab_trigger ${currentTab === "NOTES" ? "ca_active" : ""} ${
                opponentNotes ? "ca_green_colour" : ""
              }`}
              onClick={(e) => setAndSaveCurrentTab("NOTES")}
            >
              <NotesIcon width="16" height="16" />
            </span>
          </div>
          {currentTab !== "STATS" ? null : (
            <div className={`ca_section ca_tab_section ca_stats`} style={{ margin: 0 }}>
              <PageStylesProvider value={{ fontColour, successColour, errorColour }}>
                <StatsChartComponent isLoading={!userAnalytics} userAnalytics={userAnalytics} />
                <MoveTimesChartComponent isLoading={!userAnalytics} userAnalytics={userAnalytics} />
              </PageStylesProvider>
            </div>
          )}
          {currentTab !== "OPENINGS" ? null : (
            <div className={`ca_section ca_tab_section ca_openings`} style={{ margin: 0 }}>
              <PageStylesProvider value={{ fontColour, successColour, errorColour }}>
                <OpeningsChartComponent isLoading={!userAnalytics} userAnalytics={userAnalytics} />
              </PageStylesProvider>
            </div>
          )}
          {currentTab !== "NOTES" ? null : (
            <div className={`ca_section ca_tab_section ca_notes}`} style={{ margin: 0 }}>
              <form action="" id="ca_save_opponent_notes_form" onSubmit={onSubmitSaveOpponentNotes}>
                <div style={{ marginBottom: "10px" }}>
                  <textarea
                    id="ca_opponent_notes"
                    className={`ca_textarea ca_placeholder ${userAnalytics ? "" : "ca_placeholder_enabled"}`}
                    value={opponentNotes ? opponentNotes : ""}
                    onChange={(e) => setOpponentNotes(e.target.value)}
                  ></textarea>
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={savingOpponentNotes}
                    className={`ca_button ca_btn-win ca_placeholder ${userAnalytics ? "" : "ca_placeholder_enabled"}`}
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }
}
