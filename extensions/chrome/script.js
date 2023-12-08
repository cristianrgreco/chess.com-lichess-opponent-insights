let user;
let opponent;
let opponentColour;
let gameType;

const API = "https://rlabb3msg0.execute-api.eu-west-2.amazonaws.com/prod/";

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

  console.log(
    `Current user: ${user}, Opponent: ${opponent}, Opponent colour: ${opponentColour}, Game type: ${gameType}`,
  );

  fetchView().then(() => {
    initSiteTabs();
    initSubTabs();
    initRealTimeEvaluation();
    document.querySelector("#ca_save_opponent_notes_form").addEventListener("submit", onSaveOpponentNotes);
  });
  fetchUserAnalytics();
  fetchOpponentNotes();
}

function fetchView() {
  console.log("Fetching HTML...");
  return fetch(chrome.runtime.getURL(`./view.html`))
    .then((response) => {
      console.log("Fetched HTML");
      return response.text();
    })
    .then((responseText) => {
      const siteHtml = document.querySelector(".round__side").innerHTML;
      document.querySelector(".round__side").innerHTML = responseText;
      document.querySelector(".origin_site_container").innerHTML = siteHtml;
    });
}

function fetchUserAnalytics() {
  console.log("Fetching user analytics...");
  fetch(`${API}/user-analytics?platform=lichess&username=${opponent}&gameType=${gameType}&colour=${opponentColour}`)
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
        document.querySelector("#ca_opponent_notes").value = responseJson.notes;
      }
    })
    .catch((response) => renderError("Failed to fetch opponent notes", response));
}

function saveOpponentNotes() {
  console.log("Saving opponent notes...");
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
    .catch((response) => renderError("Failed to save opponent notes", response));
}

function onSaveOpponentNotes(e) {
  e.preventDefault();
  saveOpponentNotes();
}

function render(response) {
  document.querySelector(".ca_container").classList.remove("ca_hidden");
  document.querySelector(".ca_loader_container").classList.add("ca_hidden");
  renderAnalytics(response);
}

function renderError(message, response) {
  console.log(response.status, response.statusText);
  document.querySelector(".ca_error").classList.remove("ca_hidden");
  document.querySelector(".ca_loader_container").classList.add("ca_hidden");
  document.querySelector(".ca_error_message").innerText = message;
}

function initSiteTabs() {
  const caContainer = document.querySelector(".ca_container");
  const originSiteContainer = document.querySelector(".origin_site_container");

  const siteTabTrigger = document.querySelector(".ca_tabs_site_trigger");
  const caTabTrigger = document.querySelector(".ca_tabs_ca_trigger");

  originSiteContainer.classList.add("ca_hidden");
  caTabTrigger.classList.add("ca_active");

  caTabTrigger.addEventListener("click", (e) => {
    caTabTrigger.classList.add("ca_active");
    siteTabTrigger.classList.remove("ca_active");
    caContainer.classList.remove("ca_hidden");
    originSiteContainer.classList.add("ca_hidden");
  });

  siteTabTrigger.addEventListener("click", (e) => {
    siteTabTrigger.classList.add("ca_active");
    caTabTrigger.classList.remove("ca_active");

    originSiteContainer.classList.remove("ca_hidden");
    caContainer.classList.add("ca_hidden");
  });
}

function initSubTabs() {
  const selectors = {
    overview: {
      trigger: document.querySelector(".ca_overview_tab_trigger"),
      el: document.querySelector(".ca_overview"),
    },
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
  };

  const hideTab = (selector) => {
    selector.trigger.classList.remove("ca_active");
    selector.el.classList.add("ca_hidden");
  };

  const showTab = (selector) => {
    selector.trigger.classList.add("ca_active");
    selector.el.classList.remove("ca_hidden");
  };

  const initTabEvents = (selectorKey) => {
    selectors[selectorKey].trigger.addEventListener("click", (e) => {
      Object.keys(selectors).forEach((key) => {
        if (key === selectorKey) showTab(selectors[key]);
        else hideTab(selectors[key]);
      });
    });
  };

  Object.keys(selectors).forEach(initTabEvents);
}

function initRealTimeEvaluation() {
  const chess = new Chess();
  const moveElementSelector = "kwdb";
  const evaluationElement = document.querySelector(".ca_evaluation");

  function fetchEvaluation() {
    const fen = chess.fen();
    const encodedFen = encodeURIComponent(fen);
    evaluationElement.innerText = "...";

    console.log("Fetching evaluation...");
    fetch(`https://stockfish.online/api/stockfish.php?fen=${encodedFen}&depth=5&mode=eval`)
      .then((response) => (response.ok ? response.json() : Promise.reject(response)))
      .then((responseJson) => {
        console.log("Fetched evaluation");
        // if another move has been made since, don't update the UI with the evaluation of the old position
        if (fen === chess.fen()) {
          const evaluationText = responseJson.data;
          const evaluation = evaluationText.match(/([0-9.\-])+/g)[0];
          evaluationElement.innerText = evaluation;
        }
      })
      .catch((response) => renderError("Failed to evaluate position", response));
  }

  function waitForElement(selector) {
    return new Promise((resolve) => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver((mutations) => {
        if (document.querySelector(selector)) {
          observer.disconnect();
          resolve(document.querySelector(selector));
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((addedNode) => {
        if (addedNode.tagName === moveElementSelector.toUpperCase()) {
          chess.move(addedNode.textContent);
          fetchEvaluation();
        }
      });
    });
  });

  const movesContainerSelector = "rm6 > l4x";
  waitForElement(movesContainerSelector).then((movesContainerElement) => {
    const existingMoves = movesContainerElement.querySelectorAll(moveElementSelector);
    if (existingMoves) {
      existingMoves.forEach((el) => chess.move(el.textContent));
      fetchEvaluation();
    }

    observer.observe(movesContainerElement, { subtree: false, childList: true });
  });
}

function renderAnalytics(response) {
  document.querySelector(".ca_opponent_name").innerText = opponent;
  renderEloSlider(response);
  renderWinStreak(response);
  document.querySelector(".ca_puzzle_rating").innerHTML = response.latestPuzzleRating?.value ?? "N/A";
  renderOverview(response);
  renderStatsChart(response);
  renderOpeningsChart(response);
}

function renderEloSlider(response) {
  const lowestEloElement = document.querySelector(".ca_elo_range_lowest_value");
  lowestEloElement.innerText = response.performance.lowestRating;
  lowestEloElement.title = new Date(response.performance.lowestRatingDateTime,)?.toLocaleDateString();

  const highestEloEl = document.querySelector(".ca_elo_range_highest_value");
  highestEloEl.innerText = response.performance.highestRating;
  highestEloEl.title = new Date(response.performance.highestRatingDateTime,)?.toLocaleDateString();

  const currentEloEl = document.querySelector(".ca_elo_range_current_value");
  currentEloEl.innerText = Math.floor(response.performance.currentRating);

  const range = response.performance.highestRating - response.performance.lowestRating;
  const diff = response.performance.currentRating - response.performance.lowestRating;
  const percentageIncrease = (diff / range) * 100;
  document.querySelector(".ca_elo_range_current").style.left = `${percentageIncrease}%`;
}

function renderWinStreak(response) {
  const winStreakEl = document.querySelector(".ca_win_streak_value")
  if (response.performance.currentWinningStreak <= 0) {
    winStreakEl.innerHTML = `-${response.performance.currentLosingStreak}`;
    winStreakEl.classList.add("ca_negative");
  } else {
    winStreakEl.innerHTML = `+${response.performance.currentWinningStreak}`;
    winStreakEl.classList.add("ca_positive");
  }
}

function renderOverview(response) {
  const winData = Object.values(response.games.stats.win).map((stat) => stat * 100);
  const loseData = Object.values(response.games.stats.lose).map((stat) => stat * 100);
  document.querySelector(".ca_win_flag_perc_value").innerHTML =
    Math.round(response.games.stats.win["outOfTimeRate"] * 100) + "%";
  document.querySelector(".ca_lose_flag_perc_value").innerHTML =
    Math.round(response.games.stats.lose["outOfTimeRate"] * 100) + "%";
}

function renderStatsChart(response) {
  const labels = Object.keys(response.games.stats.win).map((stat) => {
    switch (stat) {
      case "mateRate":
        return "Mate";
      case "resignRate":
        return "Resign";
      case "drawRate":
        return "Draw";
      case "stalemateRate":
        return "Stalemate";
      case "outOfTimeRate":
        return "Time Out";
      default:
        return "Unknown label";
    }
  });

  const winData = Object.values(response.games.stats.win).map((stat) => stat * 100);
  const loseData = Object.values(response.games.stats.lose).map((stat) => stat * 100);

  let statsChart = new Chart(document.querySelector("#ca_stats_chart"), {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          data: winData,
          borderWidth: 0,
          hoverOffset: 4,
          backgroundColor: ["#68ab5e", "#AB615E", "grey"],
        },
      ],
    },
    options: {
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: "rgb(186, 186, 186)",
          },
        },
      },
    },
  });

  const overviewTabTrigger = document.querySelector(".ca_overview_tab_trigger");
  const statsWinTrigger = document.querySelector(".ca_stats_win_trigger");
  const statsLossesTrigger = document.querySelector(".ca_stats_lose_trigger");

  overviewTabTrigger.addEventListener("click", (e) => {});
  statsWinTrigger.addEventListener("click", (e) => {
    statsChart.config.data.datasets[0].data = winData;
    statsChart.config.data.datasets[0].borderColor = "#FFFFFF";
    statsChart.update();
  });
  statsLossesTrigger.addEventListener("click", (e) => {
    statsChart.config.data.datasets[0].data = loseData;
    statsChart.config.data.datasets[0].borderColor = "#AB615E";
    statsChart.update();
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

  let openingsChart = new Chart(document.querySelector("#ca_openings_chart"), {
    type: "bar",
    data: {
      labels: openingLabels,
      datasets: [
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
      ],
    },
    options: {
      maintainAspectRatio: true,
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
            display: false,
            text: "Number of games",
            font: {
              size: 15,
            },
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
          formatter: function (value, context) {
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
          },
        },
        tooltip: {
          callbacks: {
            footer: function (ctx) {
              // todo I am not proud of this
              const value = openingNumberOfGames[ctx[0].dataIndex];
              let outofTime = 0;
              let timeout = 0;
              if (ctx[0].dataset.label === "Wins") {
                outofTime = openingWinOutOfTimeRate[ctx[0].dataIndex];
                timeout = openingWinTimeoutRate[ctx[0].dataIndex];
              } else if (ctx[0].dataset.label === "Losses") {
                outofTime = openingLoseOutOfTimeRate[ctx[0].dataIndex];
                timeout = openingLoseTimeoutRate[ctx[0].dataIndex];
              } else {
                return `Games: ${value}`;
              }
              return `Games: ${value}\nTimeouts: ${Math.round(outofTime + timeout)}`;
            },
          },
        },
      },
    },
    plugins: [ChartDataLabels],
  });
}
