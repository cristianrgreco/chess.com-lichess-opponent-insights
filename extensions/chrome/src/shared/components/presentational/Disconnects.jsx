import React from "react";

export default function Disconnects({ userAnalytics }) {
  return (
    <span className={`ca_disconnects ca_placeholder ${userAnalytics ? "" : "ca_placeholder_enabled"}`}>
      {calculateText(userAnalytics)}
    </span>
  );
}

function calculateText(userAnalytics) {
  if (userAnalytics) {
    const { totalNumberOfDisconnects, totalNumberOfGames } = userAnalytics.performance;
    const disconnectPercentage = totalNumberOfDisconnects / totalNumberOfGames;
    return `${(disconnectPercentage * 100).toFixed(1)}%`;
  } else {
    return "????";
  }
}
