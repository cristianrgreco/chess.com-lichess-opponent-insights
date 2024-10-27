import { render, screen } from "@testing-library/react";
import EloRangeComponent from "@/shared/components/EloRangeComponent";

const mockAnalytics = {
  performance: {
    lowestRating: 1200,
    highestRating: 1800,
    currentRating: 1500,
    lowestRatingDateTime: "2021-01-01T00:00:00Z",
    highestRatingDateTime: "2022-01-01T00:00:00Z",
  },
};

test("renders loading state with placeholders when isLoading is true", () => {
  render(<EloRangeComponent isLoading={true} userAnalytics={mockAnalytics} />);

  // Verify placeholders are rendered
  expect(screen.getByTestId("elo-lowest")).toHaveTextContent("????");
  expect(screen.getByTestId("elo-current")).toHaveTextContent("????");
  expect(screen.getByTestId("elo-highest")).toHaveTextContent("????");

  // Ensure title attributes are empty when loading
  expect(screen.getByTestId("elo-lowest").querySelector("div")).toHaveAttribute("title", "");
  expect(screen.getByTestId("elo-highest").querySelector("div")).toHaveAttribute("title", "");
});

test("renders correct values when not loading", () => {
  render(<EloRangeComponent isLoading={false} userAnalytics={mockAnalytics} />);

  // Ensure correct text content is rendered
  expect(screen.getByTestId("elo-lowest")).toHaveTextContent("1200");
  expect(screen.getByTestId("elo-current")).toHaveTextContent("1500");
  expect(screen.getByTestId("elo-highest")).toHaveTextContent("1800");

  // Ensure correct title attributes for dates
  expect(screen.getByTestId("elo-lowest").querySelector("div")).toHaveAttribute("title", "1/1/2021");
  expect(screen.getByTestId("elo-highest").querySelector("div")).toHaveAttribute("title", "1/1/2022");
});

test("handles missing userAnalytics data gracefully", () => {
  render(<EloRangeComponent isLoading={false} userAnalytics={{}} />);

  // Check that all values default to 0 when no data is provided
  expect(screen.getByTestId("elo-lowest")).toHaveTextContent("0");
  expect(screen.getByTestId("elo-current")).toHaveTextContent("0");
  expect(screen.getByTestId("elo-highest")).toHaveTextContent("0");
});

test("calculates percentageIncrease correctly for current rating", () => {
  render(<EloRangeComponent isLoading={false} userAnalytics={mockAnalytics} />);

  // Check that the current rating is positioned at 50% (midway between 1200 and 1800)
  expect(screen.getByTestId("elo-current")).toHaveStyle("left: 50%");
});
