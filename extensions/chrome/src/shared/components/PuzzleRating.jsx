import React from "react";

export default function PuzzleRating({ userAnalytics }) {
  return (
    <span className={`ca_puzzle_rating ca_placeholder ${userAnalytics ? "" : "ca_placeholder_enabled"}`}>
      {calculateText(userAnalytics)}
    </span>
  );
}

function calculateText(userAnalytics) {
  if (userAnalytics) {
    if (userAnalytics.latestPuzzleRating?.value) {
      return userAnalytics.latestPuzzleRating?.value;
    } else {
      return "NA";
    }
  } else {
    return "????";
  }
}
