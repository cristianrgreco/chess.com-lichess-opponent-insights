import React from "react";
import ReactDOM from "react-dom/client";
import LichessApp from "./lichess/LichessApp";
import "./index.css";

const port = chrome.runtime.connect({ name: "ca-port" });

if (document.location.hostname === "lichess.org" && document.title.includes("Play ")) {
  renderLichessApp();
}

function renderLichessApp() {
  const rootDiv = document.createElement("div");
  document.querySelector(".mchat").insertAdjacentElement("beforebegin", rootDiv);
  ReactDOM.createRoot(rootDiv).render(
    <React.StrictMode>
      <LichessApp />
    </React.StrictMode>,
  );
}
