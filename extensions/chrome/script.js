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

  const htmlUrl = browser.runtime.getURL(`./view.html`);
  fetch(htmlUrl)
    .then(response => response.text())
    .then(response => { 
      console.log("fetched html");
      document.querySelector(".round__side").innerHTML = response; })

  console.log("Fetching user analytics...");
  fetch(`https://rlabb3msg0.execute-api.eu-west-2.amazonaws.com/prod/user-analytics?platform=lichess&username=${opponent}&gameType=${gameType}&colour=${opponentColour}`)
    .then(response => response.json())
    .then(response => {
      renderAnalytics(response, opponent);
      console.log(response);
      
    })
}

function renderAnalytics(response, opponent) {
  document.querySelector(".ca_opponent_name").innerText = opponent;
  document.querySelector(".ca_performance_lowest").innerText = response.performance.lowestRating;
  document.querySelector(".ca_performance_highest").innerText = response.performance.highestRating;
  
  if(response.performance.currentWinningStreak <= 0) {
    document.querySelector(".ca_win_streak_value").innerHTML = `-${response.performance.currentLosingStreak}`;

  } else {
    document.querySelector(".ca_win_streak_value").innerHTML = `+${response.performance.currentWinningStreak}`;
  }

  renderChart(response);
  
}

function renderChart(response) {
  const openingFamilies = response.games.filter(game => game.insights.isOpeningFamily === true);
  console.log(openingFamilies);

  const openingLabels = openingFamilies.map(g => { return g.opening; });
  const openingWinRates = openingFamilies.map(g => {return g.insights.winRate * 100});
  const openingNumberOfGames = openingFamilies.map(g => {return "Games: g.insights.numberOfGames" });

  console.log(openingNumberOfGames);
  
  new Chart(document.querySelector("#ca_results_breakdown"),
    {
      type: 'bar',
      data: {
        labels: openingLabels,
        tooltipText: openingNumberOfGames,
        datasets: [{
          label: "Win Rate",
          data: openingWinRates
      }]
      },
      options: {
        tooltip: {
          enabled: true,
          callbacks: {
            footer: function(tooltipItem, data) {
              var title = "Games: " + data.tooltipText[tooltipItem[0].index];
              return title;
          }
          }
        }
      }
    }
  );
}