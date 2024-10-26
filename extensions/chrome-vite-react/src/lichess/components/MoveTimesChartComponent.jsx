import { useContext } from "react";
import { Scatter } from "react-chartjs-2";
import PageStylesContext from "../PageStylesContext.js";

export default function MoveTimesChartComponent({ isLoading, userAnalytics }) {
  const height = 110;

  if (isLoading) {
    return (
      <Scatter className="ca_placeholder ca_placeholder_enabled" height={height} data={{ labels: [], datasets: [] }} />
    );
  }

  const { fontColour } = useContext(PageStylesContext);

  const moveTimes = userAnalytics.games.moveTimes;
  const moveTimesLabels = Array.from(
    new Set(moveTimes.flatMap((moveTimesList) => moveTimesList.map((moveTime) => moveTime[0]))),
  );
  moveTimesLabels.sort();

  const maxMoveTimeLabel = Math.max(...moveTimesLabels);
  const maxMoveTimeValue = Math.max(
    ...moveTimes.flatMap((moveTimesList) => moveTimesList.map((moveTime) => moveTime[1])),
  );

  return (
    <Scatter
      height={height}
      data={{
        datasets: moveTimes.map((moveTimesList, i) => ({
          label: `Game ${i + 1}`,
          data: moveTimesList.map(([x, y]) => ({ x, y })),
          pointRadius: 1,
        })),
      }}
      options={{
        maintainAspectRatio: true,
        responsive: false,
        scales: {
          x: {
            title: {
              display: true,
              text: "Time Remaining",
              color: fontColour,
            },
            ticks: {
              color: fontColour,
              callback: formatToDpIfHasDecimals(0),
            },
            max: maxMoveTimeLabel,
            reverse: true,
          },
          y: {
            title: {
              display: true,
              text: "Time Taken",
              color: fontColour,
            },
            ticks: {
              color: fontColour,
              callback: formatToDpIfHasDecimals(0),
            },
            max: maxMoveTimeValue,
          },
        },
        plugins: {
          datalabels: {
            labels: {
              opacity: 0,
            },
          },
          title: {
            display: false,
            text: "Move Times",
            color: fontColour,
          },
          legend: {
            display: false,
            labels: {
              color: fontColour,
            },
          },
          tooltip: {
            enabled: false,
          },
        },
      }}
    />
  );
}

function formatToDpIfHasDecimals(dp) {
  return (val) => `${val.toFixed(dp).replace(/[.,]00$/, "")}s`;
}
