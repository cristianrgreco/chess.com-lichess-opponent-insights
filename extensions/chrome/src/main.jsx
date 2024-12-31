import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import LichessApp from "./lichess/LichessApp";
import ChesscomPageWrapper from "./chesscom/ChesscomPageWrapper";

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

function renderChesscomApp() {
  waitForElementOrTimeout(".skyscraper-ad-component", 2000).then(() => {
    const container = document.querySelector("#board-layout-ad");
    container.style.width = "350px";
    container.style.marginLeft = "0";
    container.style.padding = "0 20px";
    const root = document.createElement("div");
    container.innerHTML = "";
    container.insertAdjacentElement("afterbegin", root);
    const port = chrome.runtime.connect({ name: "ca-port" });
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <ChesscomPageWrapper port={port} />
      </React.StrictMode>,
    );
  });
}

function waitForElementOrTimeout(querySelector, timeoutMs) {
  let interval;
  const waitForElementPromise = new Promise((resolve) => {
    interval = setInterval(() => {
      const element = document.querySelector(querySelector);
      if (element) {
        clearInterval(interval);
        resolve(true);
      }
    }, 15);
  });

  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => {
      resolve(false);
    }, timeoutMs);
  });

  return Promise.race([waitForElementPromise, timeoutPromise]).then((value) => {
    if (interval) {
      clearInterval(interval);
    }
    return value;
  });
}
