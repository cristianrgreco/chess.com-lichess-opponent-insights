import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import OpeningsChartComponent from "@/lichess/components/OpeningsChartComponent";
import PageStylesContext from "@/lichess/PageStylesContext";
import { vi } from "vitest";
import { Bar } from "react-chartjs-2";

vi.mock("react-chartjs-2", () => ({
  Bar: vi.fn(() => <div data-testid="chart" />),
}));

test("renders a placeholder chart when isLoading is true", () => {
  render(<OpeningsChartComponent isLoading={true} userAnalytics={null} />);

  // Check that the Bar component is called with the placeholder data
  expect(Bar).toHaveBeenCalledWith(
    expect.objectContaining({
      className: "ca_placeholder ca_placeholder_enabled",
      height: 200,
      data: { labels: [], datasets: [] },
    }),
    {},
  );
});

test("renders the chart with correct data when not loading", () => {
  const mockAnalytics = {
    games: {
      openings: [
        {
          name: "Sicilian Defense",
          insights: {
            numberOfGames: 10,
            totals: {
              win: 5,
              draw: 2,
              lose: 3,
            },
          },
        },
        {
          name: "French Defense",
          insights: {
            numberOfGames: 3,
            totals: {
              win: 1,
              draw: 1,
              lose: 1,
            },
          },
        },
        {
          name: "Ruy Lopez",
          insights: {
            numberOfGames: 2, // Should be filtered out
            totals: {
              win: 0,
              draw: 0,
              lose: 2,
            },
          },
        },
      ],
    },
  };

  const mockContextValue = {
    fontColour: "black",
    successColour: "green",
    errorColour: "red",
  };

  render(
    <PageStylesContext.Provider value={mockContextValue}>
      <OpeningsChartComponent isLoading={false} userAnalytics={mockAnalytics} />
    </PageStylesContext.Provider>,
  );

  // Ensure the chart is rendered with the correct labels and datasets
  expect(screen.getByTestId("chart")).toBeInTheDocument();

  expect(Bar).toHaveBeenCalledWith(
    expect.objectContaining({
      data: {
        labels: ["Sicilian Defense", "French Defense"], // Ruy Lopez should be filtered out
        datasets: [
          {
            label: "Wins",
            data: [5, 1],
            backgroundColor: "green",
          },
          {
            label: "Draws",
            data: [2, 1],
            backgroundColor: "grey",
          },
          {
            label: "Losses",
            data: [3, 1],
            backgroundColor: "red",
          },
        ],
      },
      height: 200,
      options: expect.objectContaining({
        scales: {
          x: expect.objectContaining({
            ticks: expect.objectContaining({
              color: "black", // fontColour from context
            }),
            title: expect.objectContaining({
              text: "Number of Games",
              color: "black",
            }),
          }),
          y: expect.objectContaining({
            ticks: expect.objectContaining({
              color: "black", // fontColour from context
            }),
          }),
        },
        plugins: expect.objectContaining({
          legend: expect.objectContaining({
            labels: expect.objectContaining({
              color: "black", // fontColour from context
            }),
          }),
        }),
      }),
    }),
    {},
  );
});

test("filters out games with numberOfGames <= 2", () => {
  const mockAnalytics = {
    games: {
      openings: [
        {
          name: "Ruy Lopez",
          insights: {
            numberOfGames: 2, // Should be filtered out
            totals: {
              win: 0,
              draw: 0,
              lose: 2,
            },
          },
        },
        {
          name: "Sicilian Defense",
          insights: {
            numberOfGames: 10, // Should be included
            totals: {
              win: 5,
              draw: 2,
              lose: 3,
            },
          },
        },
      ],
    },
  };

  const mockContextValue = {
    fontColour: "black",
    successColour: "green",
    errorColour: "red",
  };

  render(
    <PageStylesContext.Provider value={mockContextValue}>
      <OpeningsChartComponent isLoading={false} userAnalytics={mockAnalytics} />
    </PageStylesContext.Provider>,
  );

  // Ensure only "Sicilian Defense" is included, and "Ruy Lopez" is filtered out
  expect(Bar).toHaveBeenCalledWith(
    expect.objectContaining({
      data: {
        labels: ["Sicilian Defense"],
        datasets: [
          {
            label: "Wins",
            data: [5], // Only Sicilian Defense
            backgroundColor: "green",
          },
          {
            label: "Draws",
            data: [2],
            backgroundColor: "grey",
          },
          {
            label: "Losses",
            data: [3],
            backgroundColor: "red",
          },
        ],
      },
    }),
    {},
  );
});

test("applies correct styles from PageStylesContext", () => {
  const mockAnalytics = {
    games: {
      openings: [
        {
          name: "Sicilian Defense",
          insights: {
            numberOfGames: 10,
            totals: {
              win: 5,
              draw: 2,
              lose: 3,
            },
          },
        },
      ],
    },
  };

  const mockContextValue = {
    fontColour: "black",
    successColour: "green",
    errorColour: "red",
  };

  render(
    <PageStylesContext.Provider value={mockContextValue}>
      <OpeningsChartComponent isLoading={false} userAnalytics={mockAnalytics} />
    </PageStylesContext.Provider>,
  );

  // Check that the Bar component is called with the correct styles
  expect(Bar).toHaveBeenCalledWith(
    expect.objectContaining({
      options: expect.objectContaining({
        scales: {
          x: expect.objectContaining({
            ticks: expect.objectContaining({
              color: "black", // fontColour from context
            }),
            title: expect.objectContaining({
              text: "Number of Games",
              color: "black", // fontColour from context
            }),
          }),
          y: expect.objectContaining({
            ticks: expect.objectContaining({
              color: "black", // fontColour from context
            }),
          }),
        },
        plugins: expect.objectContaining({
          legend: expect.objectContaining({
            labels: expect.objectContaining({
              color: "black", // fontColour from context
            }),
          }),
        }),
      }),
    }),
    {},
  );
});
