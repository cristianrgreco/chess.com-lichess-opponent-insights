import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import MoveTimesChartComponent from "@/lichess/components/MoveTimesChartComponent";
import PageStylesContext from "@/lichess/PageStylesContext";
import { vi } from "vitest";
import { Scatter } from "react-chartjs-2";

vi.mock("react-chartjs-2", () => ({
  Scatter: vi.fn(() => <div data-testid="scatter-chart" />),
}));

test("renders a placeholder chart when isLoading is true", () => {
  render(<MoveTimesChartComponent isLoading={true} userAnalytics={null} />);

  // Check that the Scatter component is called with the placeholder data
  expect(Scatter).toHaveBeenCalledWith(
    expect.objectContaining({
      className: "ca_placeholder ca_placeholder_enabled",
      height: 110,
      data: { labels: [], datasets: [] },
    }),
    {},
  );
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
      <MoveTimesChartComponent isLoading={false} userAnalytics={mockAnalytics} />
    </PageStylesContext.Provider>,
  );

  // Ensure the chart is rendered with the correct labels and datasets
  expect(screen.getByTestId("scatter-chart")).toBeInTheDocument();

  expect(Scatter).toHaveBeenCalledWith(
    expect.objectContaining({
      data: {
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
      },
      height: 110,
      options: expect.objectContaining({
        scales: {
          x: expect.objectContaining({
            ticks: expect.objectContaining({
              color: "black", // fontColour from context
            }),
            max: 110, // max of x-values (Time Remaining)
            reverse: true,
          }),
          y: expect.objectContaining({
            ticks: expect.objectContaining({
              color: "black", // fontColour from context
            }),
            max: 15, // max of y-values (Time Taken)
          }),
        },
      }),
    }),
    {},
  );
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
      <MoveTimesChartComponent isLoading={false} userAnalytics={mockAnalytics} />
    </PageStylesContext.Provider>,
  );

  // Check that the maximum move time (x-axis) and time taken (y-axis) values are calculated correctly
  expect(Scatter).toHaveBeenCalledWith(
    expect.objectContaining({
      options: expect.objectContaining({
        scales: {
          x: expect.objectContaining({
            max: 110, // max of move times (time remaining)
          }),
          y: expect.objectContaining({
            max: 15, // max of move times (time taken)
          }),
        },
      }),
    }),
    {},
  );
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
      <MoveTimesChartComponent isLoading={false} userAnalytics={mockAnalytics} />
    </PageStylesContext.Provider>,
  );

  // Check that the Scatter component is called with the correct styles
  expect(Scatter).toHaveBeenCalledWith(
    expect.objectContaining({
      options: expect.objectContaining({
        scales: {
          x: expect.objectContaining({
            ticks: expect.objectContaining({
              color: "black", // fontColour from context
            }),
            title: expect.objectContaining({
              text: "Time Remaining",
              color: "black", // fontColour from context
            }),
          }),
          y: expect.objectContaining({
            ticks: expect.objectContaining({
              color: "black", // fontColour from context
            }),
            title: expect.objectContaining({
              text: "Time Taken",
              color: "black", // fontColour from context
            }),
          }),
        },
      }),
    }),
    {},
  );
});
