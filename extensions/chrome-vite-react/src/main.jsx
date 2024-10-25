import React from "react";
import ReactDOM from "react-dom/client";
import LichessApp from "./lichess/LichessApp";
import "./index.css";

const port = chrome.runtime.connect({ name: "ca-port" });

if (document.location.hostname === "lichess.org" && document.title.includes("Play ")) {
  renderLichessApp();
}

function renderLichessApp() {
  function getLichessGameInfoFromPage() {
    const user = document.querySelector("#user_tag").innerText;

    const opponent = Array.from(document.querySelectorAll(".game__meta .player .user-link"))
      .map((playerElement) => playerElement.getAttribute("href").split("/").pop())
      .filter((player) => player !== user)[0];

    const opponentColour = document.querySelector(".game__meta .player.white").innerHTML.includes(opponent)
      ? "white"
      : "black";

    const gameType = document.querySelector(".game__meta .header .setup span[title]").innerText.toLowerCase();

    return {
      user,
      opponent,
      opponentColour,
      gameType,
    };
  }

  const rootDiv = document.createElement("div");
  document.querySelector(".mchat").insertAdjacentElement("beforebegin", rootDiv);
  ReactDOM.createRoot(rootDiv).render(
    <React.Fragment>
      <LichessApp port={port} gameInfo={getLichessGameInfoFromPage()} />
    </React.Fragment>,
  );
}
