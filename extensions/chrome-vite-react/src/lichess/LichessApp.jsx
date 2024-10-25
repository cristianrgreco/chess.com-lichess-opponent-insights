import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useEffect, useState } from "react";
import * as api from "./api.js";
import AuthComponent from "./components/AuthComponent";
import EloRangeComponent from "./components/EloRangeComponent";

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

  const actions = (message) => ({
    GET_LICHESS_ACCESS_TOKEN: () => {
      if (message.payload) {
        setAccessToken(message.payload.value);
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

  function setAndSaveCurrentTab(currentTab) {
    setCurrentTab(currentTab);
    port.postMessage({ action: "SAVE_PREFERENCES", payload: { currentTab } });
  }

  function onRetrievePreferences(preferences) {
    if (preferences) {
      console.log("Setting current tab from preferences", preferences.currentTab);
      setCurrentTab(preferences.currentTab);
    } else {
      console.log("No preferences found");
    }
  }

  function fetchUserAnalytics() {
    console.log("Fetching user analytics...");
    api
      .fetchUserAnalytics(opponent, opponentColour, gameType, accessToken)
      .then((response) => {
        console.log("Fetched user analytics");
        setUserAnalytics(response);
        renderAnalytics(response);
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

  function renderAnalytics(response) {
    renderStatsChart(response);
    renderMoveTimesChart(response);
    renderOpeningsChart(response);
  }

  function renderMoveTimesChart(response) {
    const moveTimesLabels = Array.from(
      new Set(response.games.moveTimes.flatMap((moveTimesList) => moveTimesList.map((moveTime) => moveTime[0]))),
    );
    moveTimesLabels.sort();

    const maxMoveTimeLabel = Math.max(...moveTimesLabels);
    const maxMoveTimeValue = Math.max(
      ...response.games.moveTimes.flatMap((moveTimesList) => moveTimesList.map((moveTime) => moveTime[1])),
    );

    const moveTimesData = response.games.moveTimes.map((moveTimesList, i) => ({
      label: `Game ${i + 1}`,
      data: moveTimesList.map(([x, y]) => ({ x, y })),
      pointRadius: 1,
    }));

    const formatToDpIfHasDecimals = (dp) => (val) => `${val.toFixed(dp).replace(/[.,]00$/, "")}s`;

    new Chart(document.querySelector("#ca_stats_move_times_chart"), {
      type: "scatter",
      data: {
        datasets: moveTimesData,
      },
      options: {
        maintainAspectRatio: true,
        responsive: false,
        scales: {
          x: {
            title: {
              display: true,
              text: "Time Remaining",
              color: fontColour,
            },
            ticks: {
              color: fontColour,
              callback: formatToDpIfHasDecimals(0),
            },
            max: maxMoveTimeLabel,
            reverse: true,
          },
          y: {
            title: {
              display: true,
              text: "Time Taken",
              color: fontColour,
            },
            ticks: {
              color: fontColour,
              callback: formatToDpIfHasDecimals(0),
            },
            max: maxMoveTimeValue,
          },
        },
        plugins: {
          title: {
            display: false,
            text: "Move Times",
            color: fontColour,
          },
          legend: {
            display: false,
            labels: {
              color: fontColour,
            },
          },
          tooltip: {
            enabled: false,
          },
        },
      },
    });
  }

  function renderStatsChart(response) {
    const labels = ["Wins", "Losses"];

    const winByMate = response.games.stats.win.mateRate;
    const winByResign = response.games.stats.win.resignRate;
    const winByFlag = response.games.stats.win.outOfTimeRate;
    const winByOther = 1 - (winByMate + winByResign + winByFlag);

    const loseByMate = response.games.stats.lose.mateRate;
    const loseByResign = response.games.stats.lose.resignRate;
    const loseByFlag = response.games.stats.lose.outOfTimeRate;
    const loseByOther = 1 - (loseByMate + loseByResign + loseByFlag);

    const data = [
      {
        label: "Mate",
        data: [winByMate, loseByMate],
        backgroundColor: successColour,
      },
      {
        label: "Resign",
        data: [winByResign, loseByResign],
        backgroundColor: errorColour,
      },
      {
        label: "Flag",
        data: [winByFlag, loseByFlag],
        backgroundColor: "grey",
      },
      {
        label: "Other",
        data: [winByOther, loseByOther],
        backgroundColor: "#5e62ab",
      },
    ];

    new Chart(document.querySelector("#ca_stats_chart"), {
      type: "bar",
      data: {
        labels,
        datasets: data,
      },
      options: {
        maintainAspectRatio: true,
        responsive: false,
        scaleShowValues: true,
        indexAxis: "y",
        scales: {
          x: {
            stacked: true,
            ticks: {
              autoSkip: false,
              color: fontColour,
              callback: (val) => `${val * 100}%`,
            },
            max: 1,
            title: {
              display: false,
              text: "% Outcome",
              font: {
                size: 12,
              },
              color: fontColour,
            },
          },
          y: {
            stacked: true,
            ticks: {
              autoSkip: false,
              color: fontColour,
            },
          },
        },
        plugins: {
          datalabels: {
            formatter: (value, context) => {
              const val = context.dataset.data[context.dataIndex];
              if (val > 0) {
                return `${Math.ceil(val * 100)}`;
              }
              return "";
            },
            labels: {
              value: {
                color: "white",
                font: {
                  size: 10,
                },
              },
            },
          },
          title: {
            display: false,
            text: "Game Results",
            color: fontColour,
          },
          legend: {
            labels: {
              color: fontColour,
              boxWidth: 12,
              boxHeight: 12,
            },
          },
          tooltip: {
            enabled: false,
            callbacks: {
              label: (tooltipItem) => `${tooltipItem.formattedValue}%`,
            },
          },
        },
      },
      plugins: [ChartDataLabels],
    });
  }

  function renderOpeningsChart(response) {
    const data = response.games.openings.filter((g) => g.insights.numberOfGames > 2);
    const openingLabels = data.map((g) => g.name);
    const totalWins = data.map((g) => g.insights.totals.win);
    const totalDraws = data.map((g) => g.insights.totals.draw);
    const totalLosses = data.map((g) => g.insights.totals.lose);

    const datasets = [
      {
        label: "Wins",
        data: totalWins,
        backgroundColor: successColour,
      },
      {
        label: "Draws",
        data: totalDraws,
        backgroundColor: "grey",
      },
      {
        label: "Losses",
        data: totalLosses,
        backgroundColor: errorColour,
      },
    ];

    new Chart(document.querySelector("#ca_openings_chart"), {
      type: "bar",
      data: {
        labels: openingLabels,
        datasets: datasets,
      },
      options: {
        maintainAspectRatio: true,
        responsive: false,
        scaleShowValues: true,
        indexAxis: "y",
        scales: {
          x: {
            stacked: true,
            ticks: {
              autoSkip: false,
              color: fontColour,
            },
            title: {
              display: true,
              text: "Number of Games",
              font: {
                size: 12,
              },
              color: fontColour,
            },
          },
          y: {
            stacked: true,
            ticks: {
              autoSkip: false,
              color: fontColour,
            },
          },
        },
        plugins: {
          tooltip: {
            enabled: false,
          },
          datalabels: {
            formatter: (value, context) => {
              const val = context.dataset.data[context.dataIndex];
              if (val > 0) {
                return val;
              }
              return "";
            },
            labels: {
              value: {
                color: "white",
                font: {
                  size: 10,
                },
              },
            },
          },
          legend: {
            labels: {
              color: fontColour,
              boxWidth: 12,
              boxHeight: 12,
            },
          },
        },
      },
      plugins: [ChartDataLabels],
    });
  }

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

  const supportedGameTypes = ["bullet", "blitz", "rapid", "classical"];
  if (!supportedGameTypes.includes(gameType)) {
    console.log(`Unsupported game type ${gameType}. Not rendering.`);
    return null;
  }

  if (!accessToken) {
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-puzzle"
                  viewBox="0 0 16 16"
                >
                  <path d="M3.112 3.645A1.5 1.5 0 0 1 4.605 2H7a.5.5 0 0 1 .5.5v.382c0 .696-.497 1.182-.872 1.469a.459.459 0 0 0-.115.118.113.113 0 0 0-.012.025L6.5 4.5v.003l.003.01c.004.01.014.028.036.053a.86.86 0 0 0 .27.194C7.09 4.9 7.51 5 8 5c.492 0 .912-.1 1.19-.24a.86.86 0 0 0 .271-.194.213.213 0 0 0 .039-.063v-.009a.112.112 0 0 0-.012-.025.459.459 0 0 0-.115-.118c-.375-.287-.872-.773-.872-1.469V2.5A.5.5 0 0 1 9 2h2.395a1.5 1.5 0 0 1 1.493 1.645L12.645 6.5h.237c.195 0 .42-.147.675-.48.21-.274.528-.52.943-.52.568 0 .947.447 1.154.862C15.877 6.807 16 7.387 16 8s-.123 1.193-.346 1.638c-.207.415-.586.862-1.154.862-.415 0-.733-.246-.943-.52-.255-.333-.48-.48-.675-.48h-.237l.243 2.855A1.5 1.5 0 0 1 11.395 14H9a.5.5 0 0 1-.5-.5v-.382c0-.696.497-1.182.872-1.469a.459.459 0 0 0 .115-.118.113.113 0 0 0 .012-.025L9.5 11.5v-.003a.214.214 0 0 0-.039-.064.859.859 0 0 0-.27-.193C8.91 11.1 8.49 11 8 11c-.491 0-.912.1-1.19.24a.859.859 0 0 0-.271.194.214.214 0 0 0-.039.063v.003l.001.006a.113.113 0 0 0 .012.025c.016.027.05.068.115.118.375.287.872.773.872 1.469v.382a.5.5 0 0 1-.5.5H4.605a1.5 1.5 0 0 1-1.493-1.645L3.356 9.5h-.238c-.195 0-.42.147-.675.48-.21.274-.528.52-.943.52-.568 0-.947-.447-1.154-.862C.123 9.193 0 8.613 0 8s.123-1.193.346-1.638C.553 5.947.932 5.5 1.5 5.5c.415 0 .733.246.943.52.255.333.48.48.675.48h.238l-.244-2.855zM4.605 3a.5.5 0 0 0-.498.55l.001.007.29 3.4A.5.5 0 0 1 3.9 7.5h-.782c-.696 0-1.182-.497-1.469-.872a.459.459 0 0 0-.118-.115.112.112 0 0 0-.025-.012L1.5 6.5h-.003a.213.213 0 0 0-.064.039.86.86 0 0 0-.193.27C1.1 7.09 1 7.51 1 8c0 .491.1.912.24 1.19.07.14.14.225.194.271a.213.213 0 0 0 .063.039H1.5l.006-.001a.112.112 0 0 0 .025-.012.459.459 0 0 0 .118-.115c.287-.375.773-.872 1.469-.872H3.9a.5.5 0 0 1 .498.542l-.29 3.408a.5.5 0 0 0 .497.55h1.878c-.048-.166-.195-.352-.463-.557-.274-.21-.52-.528-.52-.943 0-.568.447-.947.862-1.154C6.807 10.123 7.387 10 8 10s1.193.123 1.638.346c.415.207.862.586.862 1.154 0 .415-.246.733-.52.943-.268.205-.415.39-.463.557h1.878a.5.5 0 0 0 .498-.55l-.001-.007-.29-3.4A.5.5 0 0 1 12.1 8.5h.782c.696 0 1.182.497 1.469.872.05.065.091.099.118.115.013.008.021.01.025.012a.02.02 0 0 0 .006.001h.003a.214.214 0 0 0 .064-.039.86.86 0 0 0 .193-.27c.14-.28.24-.7.24-1.191 0-.492-.1-.912-.24-1.19a.86.86 0 0 0-.194-.271.215.215 0 0 0-.063-.039H14.5l-.006.001a.113.113 0 0 0-.025.012.459.459 0 0 0-.118.115c-.287.375-.773.872-1.469.872H12.1a.5.5 0 0 1-.498-.543l.29-3.407a.5.5 0 0 0-.497-.55H9.517c.048.166.195.352.463.557.274.21.52.528.52.943 0 .568-.447.947-.862 1.154C9.193 5.877 8.613 6 8 6s-1.193-.123-1.638-.346C5.947 5.447 5.5 5.068 5.5 4.5c0-.415.246-.733.52-.943.268-.205.415-.39.463-.557H4.605z" />
                </svg>
                <span className={`ca_puzzle_rating ca_placeholder ${userAnalytics ? "" : "ca_placeholder_enabled"}`}>
                  {userAnalytics ? (userAnalytics.latestPuzzleRating?.value ?? "NA") : "????"}
                </span>
              </div>
              <div className="ca_opponent_info_section" title="Disconnects">
                <svg
                  fill="currentColor"
                  width="16"
                  height="16"
                  viewBox="0 0 1024 1024"
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon"
                >
                  <path d="M917.7 148.8l-42.4-42.4c-1.6-1.6-3.6-2.3-5.7-2.3s-4.1.8-5.7 2.3l-76.1 76.1a199.27 199.27 0 0 0-112.1-34.3c-51.2 0-102.4 19.5-141.5 58.6L432.3 308.7a8.03 8.03 0 0 0 0 11.3L704 591.7c1.6 1.6 3.6 2.3 5.7 2.3 2 0 4.1-.8 5.7-2.3l101.9-101.9c68.9-69 77-175.7 24.3-253.5l76.1-76.1c3.1-3.2 3.1-8.3 0-11.4zM769.1 441.7l-59.4 59.4-186.8-186.8 59.4-59.4c24.9-24.9 58.1-38.7 93.4-38.7 35.3 0 68.4 13.7 93.4 38.7 24.9 24.9 38.7 58.1 38.7 93.4 0 35.3-13.8 68.4-38.7 93.4zm-190.2 105a8.03 8.03 0 0 0-11.3 0L501 613.3 410.7 523l66.7-66.7c3.1-3.1 3.1-8.2 0-11.3L441 408.6a8.03 8.03 0 0 0-11.3 0L363 475.3l-43-43a7.85 7.85 0 0 0-5.7-2.3c-2 0-4.1.8-5.7 2.3L206.8 534.2c-68.9 69-77 175.7-24.3 253.5l-76.1 76.1a8.03 8.03 0 0 0 0 11.3l42.4 42.4c1.6 1.6 3.6 2.3 5.7 2.3s4.1-.8 5.7-2.3l76.1-76.1c33.7 22.9 72.9 34.3 112.1 34.3 51.2 0 102.4-19.5 141.5-58.6l101.9-101.9c3.1-3.1 3.1-8.2 0-11.3l-43-43 66.7-66.7c3.1-3.1 3.1-8.2 0-11.3l-36.6-36.2zM441.7 769.1a131.32 131.32 0 0 1-93.4 38.7c-35.3 0-68.4-13.7-93.4-38.7a131.32 131.32 0 0 1-38.7-93.4c0-35.3 13.7-68.4 38.7-93.4l59.4-59.4 186.8 186.8-59.4 59.4z" />
                </svg>
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-journal-text"
                viewBox="0 0 16 16"
              >
                <path d="M5 10.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5m0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m0-2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5" />
                <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2" />
                <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1z" />
              </svg>
            </span>
          </div>
          <div
            className={`ca_section ca_tab_section ca_stats ${currentTab === "STATS" ? "" : "ca_hidden"}`}
            style={{ margin: 0 }}
          >
            <canvas
              id="ca_stats_chart"
              className={`ca_placeholder ${userAnalytics ? "" : "ca_placeholder_enabled"}`}
              height="90"
            ></canvas>
            <canvas
              id="ca_stats_move_times_chart"
              className={`ca_placeholder ${userAnalytics ? "" : "ca_placeholder_enabled"}`}
              height="110"
            ></canvas>
          </div>
          <div
            className={`ca_section ca_tab_section ca_openings ${currentTab === "OPENINGS" ? "" : "ca_hidden"}`}
            style={{ margin: 0 }}
          >
            <canvas
              id="ca_openings_chart"
              className={`ca_placeholder ${userAnalytics ? "" : "ca_placeholder_enabled"}`}
              height="200"
            ></canvas>
          </div>
          <div
            className={`ca_section ca_tab_section ca_notes ${currentTab === "NOTES" ? "" : "ca_hidden"}`}
            style={{ margin: 0 }}
          >
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
        </div>
      </div>
    );
  }
}
