import { useContext } from "react";
import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import PageStylesContext from "../PageStylesContext.js";

export default function StatsChartComponent({ isLoading, userAnalytics }) {
  const { fontColour, successColour, errorColour } = useContext(PageStylesContext);

  if (!isLoading) {
    const labels = ["Wins", "Losses"];

    const { win, lose } = userAnalytics.games.stats;

    const winByMate = win.mateRate;
    const winByResign = win.resignRate;
    const winByFlag = win.outOfTimeRate;
    const winByOther = 1 - (winByMate + winByResign + winByFlag);

    const loseByMate = lose.mateRate;
    const loseByResign = lose.resignRate;
    const loseByFlag = lose.outOfTimeRate;
    const loseByOther = 1 - (loseByMate + loseByResign + loseByFlag);

    const data = [
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
    ];

    new Chart(document.querySelector("#ca_stats_chart"), {
      type: "bar",
      data: {
        labels,
        datasets: data,
      },
      options: {
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
      },
      plugins: [ChartDataLabels],
    });
  }

  return (
    <canvas
      id="ca_stats_chart"
      className={`ca_placeholder ${isLoading ? "ca_placeholder_enabled" : ""}`}
      height="90"
    ></canvas>
  );
}
