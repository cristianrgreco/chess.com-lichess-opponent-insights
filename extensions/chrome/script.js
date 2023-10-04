if (document.title.indexOf("Play ") !== -1) {
  const user = document.querySelector("#user_tag").innerText;

  const [opponent] = Array.from(document.querySelectorAll(".game__meta .player .user-link"))
    .map(playerElement => playerElement.getAttribute("href").split("/").pop())
    .filter(player => player !== user);

  const opponentColour = document.querySelector(".game__meta .player.white").innerHTML.includes(opponent) ? "white" : "black";

  const gameType = document.querySelector(".game__meta .header .setup span[title]").innerText.toLowerCase();

  console.log("Current user: " + user);
  console.log("Opponent: " + opponent);
  console.log("Opponent colour: " + opponentColour);
  console.log("Game type: " + gameType);

  const htmlUrl = chrome.runtime.getURL(`./view.html`);
  let viewHtml = "";
  console.log("HTML URL: " + htmlUrl);
  fetch(htmlUrl)
    .then(response => response.text())
    .then(response => {
      console.log("Fetched html");
      viewHtml = response;
    })

  console.log("Fetching user analytics...");
  fetch(`https://rlabb3msg0.execute-api.eu-west-2.amazonaws.com/prod/user-analytics?platform=lichess&username=${opponent}&gameType=${gameType}&colour=${opponentColour}`)
    .then(response => response.json())
    .then(response => {
      document.querySelector(".round__side").innerHTML = viewHtml // todo viewHtml may not be resolved, chain the promise
      const statsTabTrigger = document.querySelector(".ca_stats_tab_trigger");
      const openingsTabTrigger = document.querySelector(".ca_openings_tab_trigger");
      const statsEl = document.querySelector(".ca_stats");
      const openingsEl = document.querySelector(".ca_openings");
      statsTabTrigger.addEventListener("click", e => {
        statsTabTrigger.classList.add("ca_active");
        statsEl.classList.remove("ca_hidden");
        openingsTabTrigger.classList.remove("ca_active");
        openingsEl.classList.add("ca_hidden");
      });
      openingsTabTrigger.addEventListener("click", e => {
        statsTabTrigger.classList.remove("ca_active");
        statsEl.classList.add("ca_hidden");
        openingsTabTrigger.classList.add("ca_active");
        openingsEl.classList.remove("ca_hidden");
      });

      renderAnalytics(response, opponent);
    })
}

function renderAnalytics(response, opponent) {
  document.querySelector(".ca_opponent_name").innerText = opponent;

  document.querySelector(".ca_elo_range_lowest_value").innerText = response.performance.lowestRating;
  document.querySelector(".ca_elo_range_lowest_value").title = new Date(response.performance.lowestRatingDateTime)?.toLocaleDateString();
  document.querySelector(".ca_elo_range_highest_value").innerText = response.performance.highestRating;
  document.querySelector(".ca_elo_range_highest_value").title = new Date(response.performance.highestRatingDateTime)?.toLocaleDateString();
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

  renderStatsChart(response);
  renderOpeningsChart(response);
}

function renderStatsChart(response) {
  const labels = Object.keys(response.games.stats.win).map(stat => {
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
        return "Out of Time";
      default:
        return "Unknown label";
    }
  });
  const winData = Object.values(response.games.stats.win).map(stat => stat * 100);
  const loseData = Object.values(response.games.stats.lose).map(stat => stat * 100);

  let statsChart = new Chart(
    document.querySelector("#ca_stats_chart"),
    {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data: winData,
          borderColour: "#FFFFFF",
          hoverOffset: 4
        }]
      },
      options: {
        plugins: {
          legend: {
            labels: {
              color: 'rgb(186, 186, 186)',
            },
          }
        }
      }
    },
  );

  const statsWinTrigger = document.querySelector(".ca_stats_win_trigger");
  const statsLossesTrigger = document.querySelector(".ca_stats_lose_trigger");
  statsWinTrigger.addEventListener("click", e => {
    statsChart.config.data.datasets[0].data = winData;
    statsChart.config.data.datasets[0].borderColor = "#FFFFFF";
    statsChart.update();
    statsLossesTrigger.classList.remove("selected");
    statsWinTrigger.classList.add("selected");
  });
  statsLossesTrigger.addEventListener("click", e => {
    statsChart.config.data.datasets[0].data = loseData;
    statsChart.config.data.datasets[0].borderColor = "#AB615E";
    statsChart.update();
    statsLossesTrigger.classList.add("selected");
    statsWinTrigger.classList.remove("selected");
  });
}

function renderOpeningsChart(response) {
  const calcResultRate = (opening, rateName) => ((opening.insights.results[rateName] ?? 0) / opening.insights.numberOfGames) * 100
  const openingLabels = response.games.openings.map(g => g.name);
  const openingMateRate = response.games.openings.map(g => calcResultRate(g, "mate")).slice(0, 10);
  const openingResignRate = response.games.openings.map(g => calcResultRate(g, "resign")).slice(0, 10);
  const openingDrawRate = response.games.openings.map(g => calcResultRate(g, "draw")).slice(0, 10);
  const openingStalemateRate = response.games.openings.map(g => calcResultRate(g, "stalemate")).slice(0, 10);
  const openingOutOfTimeRate = response.games.openings.map(g => calcResultRate(g, "outoftime")).slice(0, 10);
  const openingTimeoutRate = response.games.openings.map(g => calcResultRate(g, "timeout")).slice(0, 10);
  const openingNumberOfGames = response.games.openings.map(g => g.insights.numberOfGames).slice(0, 10);

  const totalWins = response.games.openings.map(g => g.insights.totals.win);
  const totalDraws = response.games.openings.map(g => g.insights.totals.draw);
  const totalLosses = response.games.openings.map(g => g.insights.totals.lose);

  new Chart(document.querySelector("#ca_openings_chart"),
    {
      type: 'bar',
      data: {
        labels: openingLabels,
        datasets: [{
          label: 'Wins',
          data: totalWins,
          backgroundColor: "#68ab5e"
        }, {
          label: 'Draws',
          data: totalDraws,
          backgroundColor: "grey"
        }, {
          label: 'Losses',
          data: totalLosses,
          backgroundColor: "#AB615E"
        }]
      },
      options: {
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          x: {
            stacked: true,
            ticks: {
              color: "rgb(186, 186, 186)"
            },
            title: {
              display: true,
              text: "Number of games",
              font: {
                size: 15
              }
            }
          },
          y: {
            stacked: true,
            ticks: {
              color: "rgb(186, 186, 186)"
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: 'rgb(186, 186, 186)',
            },
          },
          tooltip: {
            callbacks: {
              footer: function(ctx) {
                const value = openingNumberOfGames[ctx[0].dataIndex];
                const timeout = openingOutOfTimeRate[ctx[0].dataIndex];
                return `Games: ${value}\nTimeouts: ${timeout}`;
              },
            }
          }
        }
      }
    }
  );
}