import { useContext, useMemo } from "react";
import { Scatter } from "react-chartjs-2";
import { PageStylesContext, ChartPlaceholder } from "@/shared";

export default function MoveTimesChart({ isLoading, userAnalytics, height = 110 }) {
  if (isLoading) {
    return <ChartPlaceholder height={height} />;
  }

  const pageStyles = useContext(PageStylesContext);
  const { data, options } = useMemo(
    () => calculateGraphData(userAnalytics.games.moveTimes, pageStyles),
    [userAnalytics],
  );

  return <Scatter height={height} data={data} options={options} />;
}

function calculateGraphData(moveTimes, { fontColour }) {
  const moveTimesLabels = Array.from(new Set(moveTimes.flatMap((list) => list.map((moveTime) => moveTime[0]))));
  moveTimesLabels.sort();

  const maxMoveTimeLabel = Math.max(...moveTimesLabels);
  const maxMoveTimeValue = Math.max(
    ...moveTimes.flatMap((moveTimesList) => moveTimesList.map((moveTime) => moveTime[1])),
  );

  const data = {
    datasets: moveTimes.map((moveTimesList, i) => ({
      label: `Game ${i + 1}`,
      data: moveTimesList.map(([x, y]) => ({ x, y })),
      pointRadius: 1,
    })),
  };

  const options = {
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
  };

  return { data, options };
}

function formatToDpIfHasDecimals(dp) {
  return (val) => `${val.toFixed(dp).replace(/[.,]00$/, "")}s`;
}
