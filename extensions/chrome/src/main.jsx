import React from "react";
import ReactDOM from "react-dom/client";
import LichessApp from "./lichess/LichessApp";
import "./index.css";
import ChesscomApp from "@/chesscom/ChesscomApp.jsx";
import { GAME_TYPES } from "@/constants.js";

if (document.location.hostname === "lichess.org" && document.title.includes("Play ")) {
  renderLichessApp();
} else if (document.location.hostname === "www.chess.com") {
  renderChesscomApp();
}

function renderLichessApp() {
  const port = chrome.runtime.connect({ name: "ca-port" });
  const rootDiv = document.createElement("div");
  document.querySelector(".mchat").insertAdjacentElement("beforebegin", rootDiv);

  ReactDOM.createRoot(rootDiv).render(
    <React.StrictMode>
      <LichessApp port={port} gameInfo={getLichessGameInfoFromPage()} />
    </React.StrictMode>,
  );
}

function getLichessGameInfoFromPage() {
  const user = document.querySelector("#user_tag").innerText;
  const opponent = Array.from(document.querySelectorAll(".game__meta .player .user-link"))
    .map((playerElement) => playerElement.getAttribute("href").split("/").pop())
    .filter((player) => player !== user)[0];
  const opponentColour = document.querySelector(".game__meta .player.white").innerHTML.includes(opponent)
    ? "white"
    : "black";
  const gameType = document.querySelector(".game__meta .header .setup span[title]").innerText.toLowerCase();
  return { user, opponent, opponentColour, gameType };
}

async function renderChesscomApp() {
  const port = chrome.runtime.connect({ name: "ca-port" });
  const rootDiv = document.createElement("div");
  document.querySelector(".skyscraper-ad-component").insertAdjacentElement("beforebegin", rootDiv);

  ReactDOM.createRoot(rootDiv).render(
    <React.StrictMode>
      <ChesscomApp port={port} gameInfo={await getChesscomGameInfoFromPage()} />
    </React.StrictMode>,
  );
}

async function getChesscomGameInfoFromPage() {
  const waitForPageData = new Promise((resolve) => {
    setInterval(() => {
      const opponent = document.querySelector(".player-top [data-test-element='user-tagline-username']").textContent;
      if (opponent !== "Opponent") {
        clearInterval(waitForPageData);
        resolve();
      }
    }, 15);
  });
  await waitForPageData;

  const opponent = document.querySelector(".player-top [data-test-element='user-tagline-username']").textContent;
  const user = document.querySelector(".player-bottom [data-test-element='user-tagline-username']").textContent;
  const opponentColour = document.querySelector(".player-top .clock-top").classList.contains("clock-white")
    ? "white"
    : "black";
  const gameType = Array.from(document.querySelector("[data-tab='game'] .icon-font-chess").classList).find((aClass) =>
    GAME_TYPES.has(aClass),
  );
  return { user, opponent, opponentColour, gameType };
}
