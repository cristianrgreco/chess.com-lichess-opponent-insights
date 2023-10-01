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
      document.querySelector(".mchat").innerHTML = viewHtml // todo viewHtml may not be resolved, chain the promise

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

  document.querySelector(".ca_performance_lowest").innerText = response.performance.lowestRating;
  document.querySelector(".ca_performance_highest").innerText = response.performance.highestRating;
  
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
  const labels = Object.keys(response.games.stats).map(stat => {
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
  const data = Object.values(response.games.stats).map(stat => stat * 100);

  new Chart(
    document.querySelector("#ca_stats_chart"),
    {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data,
          hoverOffset: 4
        }]
      },
      options: {
        borderWidth: 0,
      }
    },
  );
}

function renderOpeningsChart(response) {
  const openingLabels = response.games.openings.map(g => g.name);
  const openingMateRate = response.games.openings.map(g => ((g.insights.results.mate ?? 0) / g.insights.numberOfGames) * 100);
  const openingResignRate = response.games.openings.map(g => ((g.insights.results.resign ?? 0) / g.insights.numberOfGames) * 100);
  const openingDrawRate = response.games.openings.map(g => ((g.insights.results.draw ?? 0) / g.insights.numberOfGames) * 100);
  const openingStalemateRate = response.games.openings.map(g => ((g.insights.results.stalemate ?? 0) / g.insights.numberOfGames) * 100);
  const openingOutOfTimeRate = response.games.openings.map(g => ((g.insights.results.outoftime ?? 0) / g.insights.numberOfGames) * 100);
  const openingNumberOfGames = response.games.openings.map(g => g.insights.numberOfGames);

  new Chart(document.querySelector("#ca_openings_chart"),
    {
      type: 'bar',
      data: {
        labels: openingLabels,
        tooltipText: openingNumberOfGames,
        datasets: [{
          label: "Mate",
          data: openingMateRate
        }, {
          label: "Resign",
          data: openingResignRate
        }, {
          label: "Draw",
          data: openingDrawRate
        }, {
          label: "Stalemate",
          data: openingStalemateRate
        }, {
          label: "Out of Time",
          data: openingOutOfTimeRate
        // }, {
        //   data: openingNumberOfGames,
        //   hidden: true
        }]
      },
      options: {
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              footer: function(ctx) {
                var hiddenDataset = ctx[0].chart.config._config.data.datasets[1].data;
                var value = hiddenDataset[ctx[0].dataIndex];
                return "Games: " + value;
              },
            }
          }
        }
      }
    }
  );
}