import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi } from "vitest";
import { Bar } from "react-chartjs-2";
import { StatsChart, PageStylesContext } from "@/shared";

vi.mock("react-chartjs-2", () => ({
  Bar: vi.fn(() => <div data-testid="chart" />),
}));

test("renders a placeholder chart when isLoading is true", () => {
  render(<StatsChart isLoading={true} userAnalytics={null} />);

  const placeholderChart = screen.getByTestId("chart-placeholder");
  expect(placeholderChart).toBeInTheDocument();
  expect(placeholderChart).toHaveClass("ca_placeholder ca_placeholder_enabled");
  expect(placeholderChart).toHaveStyle("height: 90px");
});

test("renders the chart with correct data when not loading", () => {
  const mockAnalytics = {
    games: {
      stats: {
        win: {
          mateRate: 0.5,
          resignRate: 0.3,
          outOfTimeRate: 0.1,
        },
        lose: {
          mateRate: 0.4,
          resignRate: 0.2,
          outOfTimeRate: 0.2,
        },
      },
    },
  };

  const mockContextValue = {
    fontColour: "black",
    successColour: "green",
    errorColour: "red",
  };

  render(
    <PageStylesContext.Provider value={mockContextValue}>
      <StatsChart isLoading={false} userAnalytics={mockAnalytics} />
    </PageStylesContext.Provider>,
  );

  expect(Bar).toHaveBeenCalled();
  const propsPassed = Bar.mock.calls[0][0];

  expect(propsPassed.data).toEqual({
    labels: ["Wins", "Losses"],
    datasets: [
      {
        label: "Mate",
        data: [0.5, 0.4],
        backgroundColor: "green",
      },
      {
        label: "Resign",
        data: [0.3, 0.2],
        backgroundColor: "red",
      },
      {
        label: "Flag",
        data: [0.1, 0.2],
        backgroundColor: "grey",
      },
      {
        label: "Other",
        data: [expect.closeTo(0.1), expect.closeTo(0.2)],
        backgroundColor: "#5e62ab",
      },
    ],
  });

  expect(propsPassed.height).toBe(90);

  expect(propsPassed.options.scales.x.ticks.color).toBe("black");
  expect(propsPassed.options.scales.y.ticks.color).toBe("black");
  expect(propsPassed.options.plugins.legend.labels.color).toBe("black");
});
