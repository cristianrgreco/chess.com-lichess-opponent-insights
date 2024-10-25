import { useContext } from "react";
import Chart from "chart.js/auto";
import PageStylesContext from "../PageStylesContext.js";

export default function MoveTimesChartComponent({ isLoading, userAnalytics }) {
  const { fontColour, successColour, errorColour } = useContext(PageStylesContext);

  if (!isLoading) {
    const moveTimes = userAnalytics.games.moveTimes;

    const moveTimesLabels = Array.from(
      new Set(moveTimes.flatMap((moveTimesList) => moveTimesList.map((moveTime) => moveTime[0]))),
    );
    moveTimesLabels.sort();

    const maxMoveTimeLabel = Math.max(...moveTimesLabels);
    const maxMoveTimeValue = Math.max(
      ...moveTimes.flatMap((moveTimesList) => moveTimesList.map((moveTime) => moveTime[1])),
    );

    const moveTimesData = moveTimes.map((moveTimesList, i) => ({
      label: `Game ${i + 1}`,
      data: moveTimesList.map(([x, y]) => ({ x, y })),
      pointRadius: 1,
    }));

    const formatToDpIfHasDecimals = (dp) => (val) => `${val.toFixed(dp).replace(/[.,]00$/, "")}s`;

    new Chart(document.querySelector("#ca_stats_move_times_chart"), {
      type: "scatter",
      data: {
        datasets: moveTimesData,
      },
      options: {
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
      },
    });
  }

  return (
    <canvas
      id="ca_stats_move_times_chart"
      className={`ca_placeholder ${isLoading ? "ca_placeholder_enabled" : ""}`}
      height="110"
    ></canvas>
  );
}
