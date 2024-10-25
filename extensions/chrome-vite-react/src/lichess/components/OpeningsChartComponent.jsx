import { useContext } from "react";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import PageStylesContext from "../PageStylesContext.js";

export default function OpeningsChartComponent({ isLoading, userAnalytics }) {
  if (isLoading) {
    return <Bar className="ca_placeholder ca_placeholder_enabled" height={200} data={{ labels: [], datasets: [] }} />;
  }

  const { fontColour, successColour, errorColour } = useContext(PageStylesContext);

  const data = userAnalytics.games.openings.filter((game) => game.insights.numberOfGames > 2);
  const labels = data.map((game) => game.name);
  const totalWins = data.map((game) => game.insights.totals.win);
  const totalDraws = data.map((game) => game.insights.totals.draw);
  const totalLosses = data.map((game) => game.insights.totals.lose);

  return (
    <Bar
      height={200}
      plugins={[ChartDataLabels]}
      data={{
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
      }}
      options={{
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
      }}
    />
  );
}
