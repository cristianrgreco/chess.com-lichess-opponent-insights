import { useEffect, useState } from "react";
import * as api from "./api.js";
import "./LichessApp.css";
import "chart.js/auto";
import AuthComponent from "./components/AuthComponent";
import EloRangeComponent from "./components/EloRangeComponent";
import StatsChartComponent from "./components/StatsChartComponent";
import { PageStylesProvider } from "./PageStylesContext.js";
import OpeningsChartComponent from "./components/OpeningsChartComponent";
import MoveTimesChartComponent from "./components/MoveTimesChartComponent";
import { DisconnectIcon, NotesIcon, PuzzleIcon } from "../Icons";
import ErrorComponent from "./components/ErrorComponent";
import OpponentNotesComponent from "./components/OpponentNotesComponent";
import Tab from "./components/Tab";

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
    function listener(message) {
      switch (message.action) {
        case "GET_LICHESS_ACCESS_TOKEN":
          if (message.payload) {
            setAccessToken(message.payload.value);
          } else {
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
      console.log("Found access token");
      console.log("Fetching preferences");
      port.postMessage({ action: "GET_PREFERENCES" });
      fetchUserAnalytics();
      fetchOpponentNotes();
    }
  }, [accessToken]);

  function onClickAuthorise() {
    port.postMessage({ action: "AUTH_LICHESS", payload: { user } });
  }

  function onSaveOpponentNotes(e) {
    e.preventDefault();
    saveOpponentNotes();
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
      .fetchUserAnalytics(opponent, opponentColour, gameType, accessToken)
      .then((response) => {
        console.log("Fetched user analytics");
        setUserAnalytics(response);
      })
      .catch((response) => setError("Failed to fetch user analytics."));
  }

  function fetchOpponentNotes() {
    console.log("Fetching opponent notes");
    api
      .fetchOpponentNotes(user, opponent)
      .then((responseJson) => {
        console.log("Fetched opponent notes");
        if (responseJson.notes) {
          setOpponentNotes(responseJson.notes);
        } else {
          setOpponentNotes(undefined);
        }
      })
      .catch((response) => setError("Failed to fetch opponent notes."));
  }

  function saveOpponentNotes() {
    console.log("Saving opponent notes");
    setSavingOpponentNotes(true);
    api
      .saveOpponentNotes(user, opponent, opponentNotes)
      .then(() => console.log("Saved opponent notes"))
      .catch((response) => setError("Failed to save opponent notes."))
      .finally(() => setSavingOpponentNotes(false));
  }

  if (!["bullet", "blitz", "rapid", "classical"].includes(gameType)) {
    console.log(`Skipping unsupported game type ${gameType}`);
    return null;
  }

  if (accessToken === undefined) {
    return (
      <div className="ca_container_root">
        <AuthComponent onClickAuthorise={onClickAuthorise} />
      </div>
    );
  }

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

  if (accessToken) {
    return (
      <div className="ca_container_root">
        {error ? <ErrorComponent error={error} /> : null}
        <div className="ca_container">
          <div className="ca_section ca_opponent_info">
            <EloRangeComponent isLoading={!userAnalytics} userAnalytics={userAnalytics} />
            <div className="ca_opponent_info_sections">
              <div className="ca_opponent_info_section" title="Puzzle Rating">
                <PuzzleIcon width="16" height="16" />
                <span className={`ca_puzzle_rating ca_placeholder ${placeholderClass}`}>{puzzleRatingText}</span>
              </div>
              <div className="ca_opponent_info_section" title="Disconnects">
                <DisconnectIcon width="16" height="16" />
                <span className={`ca_disconnects ca_placeholder ${placeholderClass}`}>{disconnectsText}</span>
              </div>
              <div className="ca_opponent_info_section" title="Streak">
                <span data-icon=""></span>
                <span className={`${streakClass} ca_win_streak_value ca_placeholder ${placeholderClass}`}>
                  {streakText}
                </span>
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
              <OpponentNotesComponent
                notes={opponentNotes}
                setNotes={setOpponentNotes}
                isLoading={opponentNotes === null}
                onSave={onSaveOpponentNotes}
                isSaving={savingOpponentNotes}
              />
            </div>
          )}
        </div>
      </div>
    );
  }
}
