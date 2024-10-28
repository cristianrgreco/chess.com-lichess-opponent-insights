import React from "react";

export default function Streak({ userAnalytics }) {
  return (
    <span
      className={`${calculateClass(userAnalytics)} ca_win_streak_value ca_placeholder ${userAnalytics ? "" : "ca_placeholder_enabled"}`}
    >
      {calculateText(userAnalytics)}
    </span>
  );
}

function calculateClass(userAnalytics) {
  if (userAnalytics) {
    if (userAnalytics.performance.currentLosingStreak > 0) {
      return "ca_negative";
    } else {
      return userAnalytics.performance.currentWinningStreak > 0 ? "ca_positive" : "";
    }
  } else {
    return "";
  }
}

function calculateText(userAnalytics) {
  if (userAnalytics) {
    if (userAnalytics.performance.currentLosingStreak > 0) {
      return `-${userAnalytics.performance.currentLosingStreak}`;
    } else {
      if (userAnalytics.performance.currentWinningStreak > 0) {
        return `+${userAnalytics.performance.currentWinningStreak}`;
      } else {
        return "0";
      }
    }
  } else {
    return "???";
  }
}
