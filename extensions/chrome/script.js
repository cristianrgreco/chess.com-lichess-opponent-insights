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

  console.log("Fetching user analytics...");
  fetch(`https://rlabb3msg0.execute-api.eu-west-2.amazonaws.com/prod/user-analytics?platform=lichess&username=${opponent}&gameType=${gameType}&colour=${opponentColour}`)
    .then(response => response.json())
    .then(response => {
      console.log(response);
    })
}