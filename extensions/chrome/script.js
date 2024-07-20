let user;
let opponent;
let opponentColour;
let gameType;

const API = "https://rlabb3msg0.execute-api.eu-west-2.amazonaws.com/prod";

if (document.title.includes("Play ")) {
  init();
}

function init() {
  user = document.querySelector("#user_tag").innerText;
  opponent = Array.from(document.querySelectorAll(".game__meta .player .user-link"))
    .map((playerElement) => playerElement.getAttribute("href").split("/").pop())
    .filter((player) => player !== user)[0];
  opponentColour = document.querySelector(".game__meta .player.white").innerHTML.includes(opponent) ? "white" : "black";
  gameType = document.querySelector(".game__meta .header .setup span[title]").innerText.toLowerCase();

  const supportedGameTypes = ["bullet", "blitz", "rapid", "classical"];
  if (!supportedGameTypes.includes(gameType)) {
    console.log(`Unsupported game type: ${gameType}`);
    return;
  }

  console.log(
    `Current user: ${user}, Opponent: ${opponent}, Opponent colour: ${opponentColour}, Game type: ${gameType}`,
  );

  const port = chrome.runtime.connect({ name: "ca-port" });

  fetchView().then(() => {
    port.onMessage.addListener((message) => {
      if (message.action === "GET_LICHESS_ACCESS_TOKEN") {
        if (!message.payload) {
          setupAuthContainerLogo();
          setupAuthLichessButtonClick(port);
          setAuthContainerVisibility(true);
        } else {
          onAccessToken(message.payload.value);
        }
      } else if (message.action === "AUTH_LICHESS") {
        onAccessToken(message.payload.value);
      } else {
        console.log(`Unhandled message received: ${message.action}`);
      }
    });
    port.postMessage({ action: "GET_LICHESS_ACCESS_TOKEN" });
  });
}

function onAccessToken(accessToken) {
  setGameInfo();
  initSubTabs();
  fetchOpponentNotes();
  setupSaveOpponentNotes();
  setAuthContainerVisibility(false);
  setLoaderVisibility(true);
  setMainContainerVisibility(true);
  fetchUserAnalytics(accessToken);
}

function setupAuthContainerLogo() {
  document.querySelector("#ca_logo").setAttribute("src", chrome.runtime.getURL(`./icons/logo_128x128.png`));
}

function setGameInfo() {
  document.querySelector(".ca_opponent_name").innerText = opponent;

  const opponentColourEl = document.querySelector(".ca_opponent_colour");
  if (opponentColour === "white") {
    opponentColourEl.title = "White";
    opponentColourEl.classList.add("ca_white");
  } else {
    opponentColourEl.title = "Black";
    opponentColourEl.classList.add("ca_black");
  }

  const gameTypeEl = document.querySelector(".ca_game_type");
  if (gameType === "bullet") {
    gameTypeEl.title = "Bullet";
    gameTypeEl.innerHTML = `<span data-icon=""></span>`;
  } else if (gameType === "blitz") {
    gameTypeEl.title = "Blitz";
    gameTypeEl.innerHTML = `<span data-icon=""></span>`;
  } else {
    gameTypeEl.title = "Rapid";
    gameTypeEl.innerHTML = `<span data-icon=""></span>`;
  }
}

function setupAuthLichessButtonClick(port) {
  document.getElementById("auth_lichess_btn").addEventListener("click", () => {
    port.postMessage({ action: "AUTH_LICHESS", payload: { user } });
  });
}

function setupSaveOpponentNotes() {
  document.querySelector("#ca_save_opponent_notes_form").addEventListener("submit", (e) => {
    e.preventDefault();
    saveOpponentNotes();
  });
}

function fetchView() {
  console.log("Fetching HTML...");
  return fetch(chrome.runtime.getURL(`./view.html`))
    .then((response) => {
      console.log("Fetched HTML");
      return response.text();
    })
    .then((responseText) => {
      document.querySelector(".mchat").insertAdjacentHTML("beforebegin", responseText);
    });
}

function fetchUserAnalytics(accessToken) {
  console.log("Fetching user analytics...");
  fetch(`${API}/user-analytics?platform=lichess&username=${opponent}&gameType=${gameType}&colour=${opponentColour}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
    .then((response) => (response.ok ? response.json() : Promise.reject(response)))
    .then((response) => {
      console.log("Fetched user analytics");
      render(response);
    })
    .catch((response) => renderError("Failed to fetch user analytics", response));
}

function fetchOpponentNotes() {
  console.log("Fetching opponent notes...");
  fetch(`${API}/opponent-notes?username=${user}&opponentName=${opponent}`)
    .then((response) => (response.ok ? response.json() : Promise.reject(response)))
    .then((responseJson) => {
      console.log("Fetched opponent notes");
      if (responseJson.notes) {
        document.querySelector(".ca_notes_tab_trigger").classList.add("ca_green_colour");
        document.querySelector("#ca_opponent_notes").value = responseJson.notes;
      }
    })
    .catch((response) => renderError("Failed to fetch opponent notes", response));
}

function saveOpponentNotes() {
  console.log("Saving opponent notes...");
  const saveButton = document.querySelector("#ca_save_opponent_notes_form button[type=submit]");
  saveButton.setAttribute("disabled", "disabled");
  fetch(`${API}/opponent-notes`, {
    method: "POST",
    body: JSON.stringify({
      username: user,
      opponentName: opponent,
      notes: document.querySelector("#ca_opponent_notes").value,
    }),
  })
    .then((response) => (response.ok ? Promise.resolve() : Promise.reject(response)))
    .then(() => console.log("Saved opponent notes"))
    .catch((response) => renderError("Failed to save opponent notes", response))
    .finally(() => {
      saveButton.removeAttribute("disabled");
    });
}

function render(response) {
  setLoaderVisibility(false);
  setMainContainerVisibility(true);
  renderAnalytics(response);
}

function renderError(message, response) {
  console.error(response);
  setLoaderVisibility(false);
  document.querySelector(".ca_error").classList.remove("ca_hidden");
  document.querySelector(".ca_error_message").innerText = message;
}

function setAuthContainerVisibility(visible) {
  if (visible) {
    document.querySelector(".ca_auth_container").classList.remove("ca_hidden");
  } else {
    document.querySelector(".ca_auth_container").classList.add("ca_hidden");
  }
}

function setMainContainerVisibility(visible) {
  if (visible) {
    document.querySelector(".ca_container").classList.remove("ca_hidden");
  } else {
    document.querySelector(".ca_container").classList.add("ca_hidden");
  }
}

function setLoaderVisibility(visible) {
  const placeholderEls = document.querySelectorAll(".ca_placeholder");
  if (visible) {
    placeholderEls.forEach((el) => el.classList.add("ca_placeholder_enabled"));
  } else {
    placeholderEls.forEach((el) => el.classList.remove("ca_placeholder_enabled"));
  }
}

function initSubTabs() {
  _initTabs({
    stats: {
      trigger: document.querySelector(".ca_stats_tab_trigger"),
      el: document.querySelector(".ca_stats"),
    },
    openings: {
      trigger: document.querySelector(".ca_openings_tab_trigger"),
      el: document.querySelector(".ca_openings"),
    },
    notes: {
      trigger: document.querySelector(".ca_notes_tab_trigger"),
      el: document.querySelector(".ca_notes"),
    },
  });
}

function renderAnalytics(response) {
  const winStreakEl = document.querySelector(".ca_win_streak_value");
  if (response.performance.currentLosingStreak > 0) {
    winStreakEl.innerText = `-${response.performance.currentLosingStreak}`;
    winStreakEl.classList.add("ca_negative");
  } else if (response.performance.currentWinningStreak > 0) {
    winStreakEl.innerText = `+${response.performance.currentWinningStreak}`;
    winStreakEl.classList.add("ca_positive");
  } else {
    winStreakEl.innerText = "0";
  }

  renderEloSlider(response);
  document.querySelector(".ca_puzzle_rating").innerText = response.latestPuzzleRating?.value ?? "N/A";
  const disconnectPercentage = (
    (response.performance.totalNumberOfDisconnects / response.performance.totalNumberOfGames) *
    100
  ).toFixed(1);
  document.querySelector(".ca_disconnects").innerText = `${disconnectPercentage}%`;
  renderStatsChart(response);
  renderMoveTimesChart(response);
  renderOpeningsChart(response);
}

function renderEloSlider(response) {
  const lowestEloElement = document.querySelector(".ca_elo_range_lowest_value");
  lowestEloElement.innerText = response.performance.lowestRating;
  lowestEloElement.title = new Date(response.performance.lowestRatingDateTime)?.toLocaleDateString();

  const highestEloEl = document.querySelector(".ca_elo_range_highest_value");
  highestEloEl.innerText = response.performance.highestRating;
  highestEloEl.title = new Date(response.performance.highestRatingDateTime)?.toLocaleDateString();

  const currentEloEl = document.querySelector(".ca_elo_range_current_value");
  currentEloEl.innerText = Math.floor(response.performance.currentRating);

  const range = response.performance.highestRating - response.performance.lowestRating;
  const diff = response.performance.currentRating - response.performance.lowestRating;
  const percentageIncrease = (diff / range) * 100;
  document.querySelector(".ca_elo_range_current").style.left = `${percentageIncrease}%`;
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

  const formatTwoDecimalPlacesIfHasDecimals = (val) => `${val.toFixed(2).replace(/[.,]00$/, "")}s`;

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
            color: "rgb(186, 186, 186)",
          },
          ticks: {
            color: "rgb(186, 186, 186)",
            callback: formatTwoDecimalPlacesIfHasDecimals,
          },
          max: maxMoveTimeLabel,
          reverse: true,
        },
        y: {
          title: {
            display: true,
            text: "Time Taken",
            color: "rgb(186, 186, 186)",
          },
          ticks: {
            color: "rgb(186, 186, 186)",
            callback: formatTwoDecimalPlacesIfHasDecimals,
          },
          max: maxMoveTimeValue,
        },
      },
      plugins: {
        title: {
          display: true,
          text: "Move Times",
          color: "rgb(186, 186, 186)",
        },
        legend: {
          display: false,
          labels: {
            color: "rgb(186, 186, 186)",
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
      backgroundColor: "#68ab5e",
    },
    {
      label: "Resign",
      data: [winByResign, loseByResign],
      backgroundColor: "#AB615E",
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
            color: "rgb(186, 186, 186)",
            callback: (val) => `${val * 100}%`,
          },
          max: 1,
          title: {
            display: false,
            text: "% Outcome",
            font: {
              size: 12,
            },
            color: "rgb(186, 186, 186)",
          },
        },
        y: {
          stacked: true,
          ticks: {
            autoSkip: false,
            color: "rgb(186, 186, 186)",
          },
        },
      },
      plugins: {
        datalabels: {
          formatter: (value, context) => {
            const val = context.dataset.data[context.dataIndex];
            if (val > 0) {
              return `${Math.ceil(val * 100)}%`;
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
          color: "rgb(186, 186, 186)",
        },
        legend: {
          labels: {
            color: "rgb(186, 186, 186)",
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
  const calcResultWinRate = (opening, rateName) =>
    ((opening.insights.results.win[rateName] ?? 0) / opening.insights.numberOfGames) * 100;
  const calcResultLoseRate = (opening, rateName) =>
    ((opening.insights.results.lose[rateName] ?? 0) / opening.insights.numberOfGames) * 100;
  const data = response.games.openings.filter((g) => g.insights.numberOfGames > 2);
  const openingLabels = data.map((g) => g.name);
  const openingMateRate = data.map((g) => calcResultWinRate(g, "mate")).slice(0, 10);
  const openingResignRate = data.map((g) => calcResultWinRate(g, "resign")).slice(0, 10);
  const openingDrawRate = data.map((g) => calcResultWinRate(g, "draw")).slice(0, 10);
  const openingStalemateRate = data.map((g) => calcResultWinRate(g, "stalemate"));
  const openingWinOutOfTimeRate = data.map((g) => calcResultWinRate(g, "outoftime"));
  const openingLoseOutOfTimeRate = data.map((g) => calcResultLoseRate(g, "outoftime"));
  const openingWinTimeoutRate = data.map((g) => calcResultWinRate(g, "timeout"));
  const openingLoseTimeoutRate = data.map((g) => calcResultLoseRate(g, "timeout"));

  const openingNumberOfGames = data.map((g) => g.insights.numberOfGames);

  const totalWins = data.map((g) => g.insights.totals.win);
  const totalDraws = data.map((g) => g.insights.totals.draw);
  const totalLosses = data.map((g) => g.insights.totals.lose);

  const datasets = [
    {
      label: "Wins",
      data: totalWins,
      backgroundColor: "#68ab5e",
    },
    {
      label: "Draws",
      data: totalDraws,
      backgroundColor: "grey",
    },
    {
      label: "Losses",
      data: totalLosses,
      backgroundColor: "#AB615E",
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
            color: "rgb(186, 186, 186)",
          },
          title: {
            display: true,
            text: "Number of Games",
            font: {
              size: 12,
            },
            color: "rgb(186, 186, 186)",
          },
        },
        y: {
          stacked: true,
          ticks: {
            autoSkip: false,
            color: "rgb(186, 186, 186)",
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
            color: "rgb(186, 186, 186)",
            boxWidth: 12,
            boxHeight: 12,
          },
        },
      },
    },
    plugins: [ChartDataLabels],
  });
}
