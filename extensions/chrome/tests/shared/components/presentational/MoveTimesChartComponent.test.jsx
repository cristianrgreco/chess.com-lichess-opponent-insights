import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi } from "vitest";
import { Scatter } from "react-chartjs-2";
import { MoveTimesChart, PageStylesContext } from "@/shared";

vi.mock("react-chartjs-2", () => ({
  Scatter: vi.fn(() => <div data-testid="scatter-chart" />),
}));

test("renders a placeholder chart when isLoading is true", () => {
  render(<MoveTimesChart isLoading={true} userAnalytics={null} />);

  const placeholderChart = screen.getByTestId("chart-placeholder");
  expect(placeholderChart).toBeInTheDocument();
  expect(placeholderChart).toHaveClass("ca_placeholder ca_placeholder_enabled");
  expect(placeholderChart).toHaveStyle("height: 110px");
});

test("renders the chart with correct data when not loading", () => {
  const mockAnalytics = {
    games: {
      moveTimes: [
        [
          [100, 5],
          [90, 10],
        ],
        [
          [110, 15],
          [80, 8],
        ],
      ],
    },
  };

  const mockContextValue = {
    fontColour: "black",
  };

  render(
    <PageStylesContext.Provider value={mockContextValue}>
      <MoveTimesChart isLoading={false} userAnalytics={mockAnalytics} />
    </PageStylesContext.Provider>,
  );

  // Ensure the chart is rendered with the correct labels and datasets
  expect(screen.getByTestId("scatter-chart")).toBeInTheDocument();

  expect(Scatter).toHaveBeenCalled();

  const propsPassed = Scatter.mock.calls[0][0];

  expect(propsPassed.data).toEqual({
    datasets: [
      {
        label: "Game 1",
        data: [
          { x: 100, y: 5 },
          { x: 90, y: 10 },
        ],
        pointRadius: 1,
      },
      {
        label: "Game 2",
        data: [
          { x: 110, y: 15 },
          { x: 80, y: 8 },
        ],
        pointRadius: 1,
      },
    ],
  });

  expect(propsPassed.options.scales.x.ticks.color).toBe("black");
  expect(propsPassed.options.scales.x.max).toBe(110);
  expect(propsPassed.options.scales.y.ticks.color).toBe("black");
  expect(propsPassed.options.scales.y.max).toBe(15);
  expect(propsPassed.height).toBe(110);
});

test("calculates maxMoveTimeLabel and maxMoveTimeValue correctly", () => {
  const mockAnalytics = {
    games: {
      moveTimes: [
        [
          [100, 5],
          [90, 10],
        ],
        [
          [110, 15],
          [80, 8],
        ],
      ],
    },
  };

  const mockContextValue = {
    fontColour: "black",
  };

  render(
    <PageStylesContext.Provider value={mockContextValue}>
      <MoveTimesChart isLoading={false} userAnalytics={mockAnalytics} />
    </PageStylesContext.Provider>,
  );

  expect(Scatter).toHaveBeenCalled();

  const propsPassed = Scatter.mock.calls[0][0];

  expect(propsPassed.options.scales.x.max).toBe(110);
  expect(propsPassed.options.scales.y.max).toBe(15);
});

test("applies correct styles from PageStylesContext", () => {
  const mockAnalytics = {
    games: {
      moveTimes: [
        [
          [100, 5],
          [90, 10],
        ],
        [
          [110, 15],
          [80, 8],
        ],
      ],
    },
  };

  const mockContextValue = {
    fontColour: "black",
  };

  render(
    <PageStylesContext.Provider value={mockContextValue}>
      <MoveTimesChart isLoading={false} userAnalytics={mockAnalytics} />
    </PageStylesContext.Provider>,
  );

  expect(Scatter).toHaveBeenCalled();

  const propsPassed = Scatter.mock.calls[0][0];

  expect(propsPassed.options.scales.x.ticks.color).toBe("black");
  expect(propsPassed.options.scales.x.title.color).toBe("black");
  expect(propsPassed.options.scales.x.title.text).toBe("Time Remaining");

  expect(propsPassed.options.scales.y.ticks.color).toBe("black");
  expect(propsPassed.options.scales.y.title.color).toBe("black");
  expect(propsPassed.options.scales.y.title.text).toBe("Time Taken");
});
