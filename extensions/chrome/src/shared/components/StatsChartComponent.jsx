import { useContext, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import PageStylesContext from "../../PageStylesContext.js";
import ChartPlaceholderComponent from "./ChartPlaceholderComponent.jsx";

export default function StatsChartComponent({ isLoading, userAnalytics, height = 90 }) {
  if (isLoading) {
    return <ChartPlaceholderComponent height={height} />;
  }

  const pageStyles = useContext(PageStylesContext);
  const { data, options } = useMemo(() => calculateGraphData(userAnalytics.games.stats, pageStyles), [userAnalytics]);

  return <Bar height={height} plugins={[ChartDataLabels]} data={data} options={options} />;
}

function calculateGraphData({ win, lose }, { successColour, errorColour, fontColour }) {
  const winByMate = win.mateRate;
  const winByResign = win.resignRate;
  const winByFlag = win.outOfTimeRate;
  const winByOther = 1 - (winByMate + winByResign + winByFlag);

  const loseByMate = lose.mateRate;
  const loseByResign = lose.resignRate;
  const loseByFlag = lose.outOfTimeRate;
  const loseByOther = 1 - (loseByMate + loseByResign + loseByFlag);

  const data = {
    labels: ["Wins", "Losses"],
    datasets: [
      {
        label: "Mate",
        data: [winByMate, loseByMate],
        backgroundColor: successColour,
      },
      {
        label: "Resign",
        data: [winByResign, loseByResign],
        backgroundColor: errorColour,
      },
      {
        label: "Flag",
        data: [winByFlag, loseByFlag],
        backgroundColor: "grey",
      },
      {
        label: "Other",
        data: [winByOther, loseByOther],
        backgroundColor: "#5e62ab",
      },
    ],
  };

  const options = {
    maintainAspectRatio: true,
    responsive: false,
    scaleShowValues: true,
    indexAxis: "y",
    scales: {
      x: {
        stacked: true,
        ticks: {
          autoSkip: false,
          color: fontColour,
          callback: (val) => `${val * 100}%`,
        },
        max: 1,
        title: {
          display: false,
          text: "% Outcome",
          font: {
            size: 12,
          },
          color: fontColour,
        },
      },
      y: {
        stacked: true,
        ticks: {
          autoSkip: false,
          color: fontColour,
        },
      },
    },
    plugins: {
      datalabels: {
        formatter: (value, context) => {
          const val = context.dataset.data[context.dataIndex];
          if (val > 0) {
            return `${Math.ceil(val * 100)}`;
          }
          return "";
        },
        labels: {
          value: {
            color: "white",
            font: {
              size: 10,
            },
          },
        },
      },
      title: {
        display: false,
        text: "Game Results",
        color: fontColour,
      },
      legend: {
        labels: {
          color: fontColour,
          boxWidth: 12,
          boxHeight: 12,
        },
      },
      tooltip: {
        enabled: false,
        callbacks: {
          label: (tooltipItem) => `${tooltipItem.formattedValue}%`,
        },
      },
    },
  };

  return { data, options };
}
