import { useEffect, useState } from "react";
import ChesscomApp from "@/chesscom/ChesscomApp.jsx";
import { GAME_TYPES } from "@/shared";

export default function ChesscomPageWrapper({ port }) {
  const [gameInfo, setGameInfo] = useState(null);

  useEffect(() => {
    const opponentEl = document.querySelector(".player-top [data-test-element='user-tagline-username']");
    const config = { characterData: true, childList: false, subtree: true };

    const callback = (mutationList) => {
      const mutation = mutationList[0];
      console.log(`Opponent name has changed: ${mutation.target.textContent}`);
      const gameInfo = getGameInfoFromPage();
      setGameInfo(gameInfo);
    };

    console.log("Starting mutation observer");
    const observer = new MutationObserver(callback);
    observer.observe(opponentEl, config);

    return () => {
      console.log("Removing mutation observer");
      observer.disconnect();
    };
  }, []);

  if (gameInfo === null) {
    return null;
  } else {
    return <ChesscomApp port={port} gameInfo={gameInfo} />;
  }
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
