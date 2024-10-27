import { useEffect, useState } from "react";
import ChesscomApp from "@/chesscom/ChesscomApp.jsx";
import { GAME_TYPES } from "@/shared";

export default function ChesscomPageWrapper({ port }) {
  const [urlPath, setUrlPath] = useState(document.location.pathname);
  const [gameInfo, setGameInfo] = useState(null);

  useEffect(() => {
    function listener(message) {
      switch (message.action) {
        case "TAB_UPDATED":
          console.log("Detected tab update");
          setUrlPath(document.location.pathname);
          break;
      }
    }

    console.log("Adding listener to port");
    port.onMessage.addListener(listener);

    return () => {
      console.log("Removing listener from port");
      port.onMessage.removeListener(listener);
    };
  }, []);

  useEffect(() => {
    console.log("Waiting for page ready");
    const { interval, promise: pageReadyPromise } = waitForPageReady();
    pageReadyPromise.then(() => {
      console.log("Page ready");
      const gameInfo = getGameInfoFromPage();
      setGameInfo(gameInfo);
    });

    return () => {
      clearInterval(interval);
    };
  }, [urlPath]);

  if (gameInfo === null) {
    return null;
  } else {
    return <ChesscomApp port={port} gameInfo={gameInfo} />;
  }
}

function waitForPageReady() {
  let interval;

  const promise = new Promise((resolve) => {
    interval = setInterval(() => {
      const opponent = document.querySelector(".player-top [data-test-element='user-tagline-username']").textContent;
      if (opponent !== "Opponent") {
        clearInterval(interval);
        resolve();
      }
    }, 15);
  });

  return { interval, promise };
}

function getGameInfoFromPage() {
  const opponent = document.querySelector(".player-top [data-test-element='user-tagline-username']").textContent;
  const user = document.querySelector(".player-bottom [data-test-element='user-tagline-username']").textContent;
  const opponentColour = document.querySelector(".player-top .clock-top").classList.contains("clock-white")
    ? "white"
    : "black";
  const gameType = Array.from(document.querySelector("[data-tab='game'] .icon-font-chess").classList).find((aClass) =>
    GAME_TYPES.has(aClass),
  );

  const gameInfo = { user, opponent, opponentColour, gameType };
  console.log("Game info", gameInfo);

  return gameInfo;
}
