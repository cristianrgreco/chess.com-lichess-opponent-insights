chrome.runtime.onConnect.addListener((port) => {
  setupStockfishMessageHandler(port);

  port.onMessage.addListener((message) => {
    if (message.action === "STOCKFISH_EVALUATION") {
      postFenToStockfish(message.payload);
    }
  });
});

const depth = 5;
const engine = new Worker("./lib/stockfish-nnue-16.js");

function setupStockfishMessageHandler(port) {
  engine.onmessage = (event) => {
    const parts = event.data.split(" ");

    if (parts[0] === "info" && parts.includes("score")) {
      const scoreIndex = parts.findIndex((part) => part === "score");
      const evalType = parts[scoreIndex + 1];
      const evalValue = parts[scoreIndex + 2];

      if (evalType === "cp") {
        port.postMessage({ action: "STOCKFISH_EVALUATION", payload: parseInt(evalValue) / 100 });
      } else if (evalType === "mate") {
        port.postMessage({ action: "STOCKFISH_EVALUATION", payload: `M${evalValue}` });
      }
    }
  };
}

function postFenToStockfish(fen) {
  engine.postMessage(`position fen ${fen}`);
  engine.postMessage(`go depth ${depth}`);
}
