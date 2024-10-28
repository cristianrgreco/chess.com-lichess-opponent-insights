import { useContext, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { PageStylesContext, ChartPlaceholder } from "@/shared";

export default function OpeningsChart({ isLoading, userAnalytics, height = 200 }) {
  if (isLoading) {
    return <ChartPlaceholder height={height} />;
  }

  const pageStyles = useContext(PageStylesContext);
  const { data, options } = useMemo(
    () => calculateGraphData(userAnalytics.games.openings, pageStyles),
    [userAnalytics],
  );

  return <Bar height={height} plugins={[ChartDataLabels]} data={data} options={options} />;
}

function calculateGraphData(openings, { successColour, errorColour, fontColour }) {
  const openingNameTruncateLength = 25;

  const commonOpenings = openings.filter((game) => game.insights.numberOfGames > 2);
  const labels = commonOpenings.map((game) => game.name);
  const totalWins = commonOpenings.map((game) => game.insights.totals.win);
  const totalDraws = commonOpenings.map((game) => game.insights.totals.draw);
  const totalLosses = commonOpenings.map((game) => game.insights.totals.lose);

  const data = {
    labels,
    datasets: [
      {
        label: "Wins",
        data: totalWins,
        backgroundColor: successColour,
      },
      {
        label: "Draws",
        data: totalDraws,
        backgroundColor: "grey",
      },
      {
        label: "Losses",
        data: totalLosses,
        backgroundColor: errorColour,
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
        },
        title: {
          display: true,
          text: "Number of Games",
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
          font: {
            size: 10,
          },
          callback: (value) => {
            const label = labels[value];
            if (label.length <= openingNameTruncateLength) {
              return label;
            }
            const firstHalf = label.substring(0, Math.floor(openingNameTruncateLength / 2));
            const secondHalf = label.substring(label.length - Math.floor(openingNameTruncateLength / 2), label.length);
            return `${firstHalf.trim()}...${secondHalf.trim()}`;
          },
        },
      },
    },
    plugins: {
      tooltip: {
        enabled: false,
      },
      datalabels: {
        formatter: (value, context) => {
          const val = context.dataset.data[context.dataIndex];
          if (val > 0) {
            return val;
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
      legend: {
        labels: {
          color: fontColour,
          boxWidth: 12,
          boxHeight: 12,
        },
      },
    },
  };

  return { data, options };
}
