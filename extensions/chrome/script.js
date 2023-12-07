if (document.title.indexOf("Play ") !== -1) {
  var user = document.querySelector("#user_tag").innerText;

  var [opponent] = Array.from(document.querySelectorAll(".game__meta .player .user-link"))
    .map((playerElement) => playerElement.getAttribute("href").split("/").pop())
    .filter((player) => player !== user);

  var opponentColour = document.querySelector(".game__meta .player.white").innerHTML.includes(opponent)
    ? "white"
    : "black";

  var gameType = document.querySelector(".game__meta .header .setup span[title]").innerText.toLowerCase();

  console.log("Current user: " + user);
  console.log("Opponent: " + opponent);
  console.log("Opponent colour: " + opponentColour);
  console.log("Game type: " + gameType);

  const htmlUrl = chrome.runtime.getURL(`./view.html`);
  let viewHtml = "";
  fetch(htmlUrl)
    .then((response) => response.text())
    .then((response) => {
      console.log("Fetched html");
      viewHtml = response;
      const site_html = document.querySelector(".round__side").innerHTML;
      document.querySelector(".round__side").innerHTML = viewHtml; // todo viewHtml may not be resolved, chain the promise
      document.querySelector(".origin_site_container").innerHTML = site_html;
      initEventListeners();
    });

  console.log("Fetching user analytics...");
  fetchUserAnalytics();

  console.log("Fetching opponent notes...");
  fetchOpponentNotes();
}

function fetchUserAnalytics() {
  fetch(
    `https://rlabb3msg0.execute-api.eu-west-2.amazonaws.com/prod/user-analytics?platform=lichess&username=${opponent}&gameType=${gameType}&colour=${opponentColour}`,
  )
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      return Promise.reject(response);
    })
    .then((response) => {
      render(response);
    })
    .catch((response) => {
      handleHttpError("Failed to fetch user analytics", response);
    });
}

function fetchOpponentNotes() {
  fetch(
    `https://rlabb3msg0.execute-api.eu-west-2.amazonaws.com/prod/opponent-notes?username=${user}&opponentName=${opponent}`,
  )
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      return Promise.reject(response);
    })
    .then((responseJson) => {
      if (responseJson.notes) {
        document.querySelector("#ca_opponent_notes").value = responseJson.notes;
      }
    })
    .catch((response) => {
      handleHttpError("Failed to fetch opponent notes", response);
    });
}

function saveOpponentNotes() {
  fetch(`https://rlabb3msg0.execute-api.eu-west-2.amazonaws.com/prod/opponent-notes`, {
    method: "POST",
    body: JSON.stringify({
      username: user,
      opponentName: opponent,
      notes: document.querySelector("#ca_opponent_notes").value,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        return Promise.reject(response);
      }
    })
    .catch((response) => {
      handleHttpError("Failed to save opponent notes", response);
    });
}

function renderError(response) {
  document.querySelector(".ca_error").classList.remove("ca_hidden");
  document.querySelector(".ca_loader_container").classList.add("ca_hidden");
  document.querySelector(".ca_error_message").innerHTML = (response.status, response.statusText);
}

function render(response) {
  document.querySelector(".ca_container").classList.remove("ca_hidden");
  document.querySelector(".ca_loader_container").classList.add("ca_hidden");
  renderAnalytics(response);
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

function initTabs() {
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

  function processEvaluation() {
    const encodedFen = encodeURIComponent(chess.fen());
    fetch(`https://stockfish.online/api/stockfish.php?fen=${encodedFen}&depth=5&mode=eval`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        return Promise.reject(response);
      })
      .then((responseJson) => {
        const evaluationText = responseJson.data;
        const evaluation = evaluationText.match(/([0-9.\-])+/g)[0];
        evaluationElement.innerText = evaluation;
      })
      .catch((response) => {
        handleHttpError("Failed to evaluate position", response);
      });
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
          processEvaluation();
        }
      });
    });
  });

  waitForElement("rm6 > l4x").then((movesContainerElement) => {
    const existingMoves = movesContainerElement.querySelectorAll(moveElementSelector);
    if (existingMoves) {
      existingMoves.forEach((el) => chess.move(el.textContent));
      processEvaluation();
    }

    observer.observe(movesContainerElement, { subtree: false, childList: true });
  });
}

function handleHttpError(message, response) {
  console.log(response.status, response.statusText);
  console.log(response);
  renderError(response);
}

function initEventListeners() {
  initSiteTabs();
  initTabs();

  const errorReloadBtnTrigger = document.querySelector(".ca_error_reload_btn");
  errorReloadBtnTrigger.addEventListener("click", (e) => {
    document.querySelector(".ca_error").classList.add("ca_hidden");
    document.querySelector(".ca_loader_container").classList.remove("ca_hidden");
    fetchUserAnalytics();
  });

  document.querySelector("#ca_save_opponent_notes_form").addEventListener("submit", (e) => {
    e.preventDefault();
    saveOpponentNotes();
  });

  initRealTimeEvaluation();
}

function renderAnalytics(response) {
  document.querySelector(".ca_opponent_name").innerText = opponent;

  document.querySelector(".ca_elo_range_lowest_value").innerText = response.performance.lowestRating;
  document.querySelector(".ca_elo_range_lowest_value").title = new Date(
    response.performance.lowestRatingDateTime,
  )?.toLocaleDateString();
  document.querySelector(".ca_elo_range_highest_value").innerText = response.performance.highestRating;
  document.querySelector(".ca_elo_range_highest_value").title = new Date(
    response.performance.highestRatingDateTime,
  )?.toLocaleDateString();
  document.querySelector(".ca_elo_range_current_value").innerText = Math.floor(response.performance.currentRating);

  const range = response.performance.highestRating - response.performance.lowestRating;
  const diff = response.performance.currentRating - response.performance.lowestRating;
  const percentageIncrease = (diff / range) * 100;
  document.querySelector(".ca_elo_range_current").style.left = `${percentageIncrease}%`;

  if (response.performance.currentWinningStreak <= 0) {
    document.querySelector(".ca_win_streak_value").innerHTML = `-${response.performance.currentLosingStreak}`;
    document.querySelector(".ca_win_streak_value").classList.add("ca_negative");
  } else {
    document.querySelector(".ca_win_streak_value").innerHTML = `+${response.performance.currentWinningStreak}`;
    document.querySelector(".ca_win_streak_value").classList.add("ca_positive");
  }

  document.querySelector(".ca_puzzle_rating").innerHTML = response.latestPuzzleRating?.value ?? "N/A";

  renderOverview(response);
  renderStatsChart(response);
  renderOpeningsChart(response);
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
  const data = response.games.openings.filter((g) => g.insights.numberOfGames > 1);
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
      indexAxis: "y",
      scales: {
        x: {
          stacked: true,
          ticks: {
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
