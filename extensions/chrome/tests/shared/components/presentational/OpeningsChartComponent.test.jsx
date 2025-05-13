import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi } from "vitest";
import { Bar } from "react-chartjs-2";
import { OpeningsChart, PageStylesContext } from "@/shared";

vi.mock("react-chartjs-2", () => ({
  Bar: vi.fn(() => <div data-testid="chart" />),
}));

test("renders a placeholder chart when isLoading is true", () => {
  render(<OpeningsChart isLoading={true} userAnalytics={null} />);

  const placeholderChart = screen.getByTestId("chart-placeholder");
  expect(placeholderChart).toBeInTheDocument();
  expect(placeholderChart).toHaveClass("ca_placeholder ca_placeholder_enabled");
  expect(placeholderChart).toHaveStyle("height: 200px");
});

test("renders the chart with correct data when not loading", () => {
  const mockAnalytics = {
    games: {
      openings: [
        {
          name: "Sicilian Defense",
          insights: { numberOfGames: 10, totals: { win: 5, draw: 2, lose: 3 } },
        },
        {
          name: "French Defense",
          insights: { numberOfGames: 3, totals: { win: 1, draw: 1, lose: 1 } },
        },
        {
          name: "Ruy Lopez",
          insights: { numberOfGames: 2, totals: { win: 0, draw: 0, lose: 2 } },
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
      <OpeningsChart isLoading={false} userAnalytics={mockAnalytics} />
    </PageStylesContext.Provider>,
  );

  expect(screen.getByTestId("chart")).toBeInTheDocument();
  expect(Bar).toHaveBeenCalled();

  const propsPassed = Bar.mock.calls[0][0];

  expect(propsPassed.data).toEqual({
    labels: ["Sicilian Defense", "French Defense"],
    datasets: [
      { label: "Wins", data: [5, 1], backgroundColor: "green" },
      { label: "Draws", data: [2, 1], backgroundColor: "grey" },
      { label: "Losses", data: [3, 1], backgroundColor: "red" },
    ],
  });

  expect(propsPassed.height).toBe(200);

  expect(propsPassed.options.scales.x.ticks.color).toBe("black");
  expect(propsPassed.options.plugins.legend.labels.color).toBe("black");
});

test("filters out games with numberOfGames <= 2", () => {
  const mockAnalytics = {
    games: {
      openings: [
        {
          name: "Ruy Lopez",
          insights: { numberOfGames: 2, totals: { win: 0, draw: 0, lose: 2 } },
        },
        {
          name: "Sicilian Defense",
          insights: { numberOfGames: 10, totals: { win: 5, draw: 2, lose: 3 } },
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
      <OpeningsChart isLoading={false} userAnalytics={mockAnalytics} />
    </PageStylesContext.Provider>,
  );

  expect(Bar).toHaveBeenCalled();
  const propsPassed = Bar.mock.calls[0][0];

  expect(propsPassed.data.labels).toEqual(["Sicilian Defense", "French Defense"]);
  expect(propsPassed.data.datasets[0].data).toEqual([5, 1]);
});

test("applies correct styles from PageStylesContext", () => {
  const mockAnalytics = {
    games: {
      openings: [
        {
          name: "Sicilian Defense",
          insights: { numberOfGames: 10, totals: { win: 5, draw: 2, lose: 3 } },
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
      <OpeningsChart isLoading={false} userAnalytics={mockAnalytics} />
    </PageStylesContext.Provider>,
  );

  expect(Bar).toHaveBeenCalled();
  const propsPassed = Bar.mock.calls[0][0];

  expect(propsPassed.options.scales.x.ticks.color).toBe("black");
  expect(propsPassed.options.scales.x.title.text).toBe("Number of Games");
  expect(propsPassed.options.scales.x.title.color).toBe("black");

  expect(propsPassed.options.scales.y.ticks.color).toBe("black");

  expect(propsPassed.options.plugins.legend.labels.color).toBe("black");
});
