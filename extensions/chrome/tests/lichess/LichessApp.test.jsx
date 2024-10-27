import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi } from "vitest";
import LichessApp from "@/lichess/LichessApp";
import { api } from "@/shared";

// Mock the API functions
vi.mock("@/shared/api", () => ({
  fetchUserAnalytics: vi.fn(),
  fetchOpponentNotes: vi.fn(),
  saveOpponentNotes: vi.fn(),
}));

// Mock the chart.js components
vi.mock("react-chartjs-2", () => ({
  Bar: () => <div data-testid="bar-chart" />,
  Scatter: () => <div data-testid="scatter-chart" />,
}));

// Mock the chrome.runtime.getURL function for the logo
global.chrome = {
  runtime: {
    getURL: vi.fn(() => "/path/to/logo_128x128.png"),
  },
};

// Mock the port object
const mockPort = {
  onMessage: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
  postMessage: vi.fn(),
};

const mockGameInfo = {
  user: "testUser",
  opponent: "testOpponent",
  opponentColour: "black",
  gameType: "blitz",
};

const mockUserAnalytics = {
  performance: {
    totalNumberOfGames: 10,
    totalNumberOfDisconnects: 3, // This will give a 30.0% disconnect rate (3/10 * 100)
    currentLosingStreak: 3,
    currentWinningStreak: 0,
  },
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
    moveTimes: [
      [
        [10, 5],
        [5, 7],
        [3, 6],
      ],
      [
        [12, 4],
        [7, 8],
        [2, 3],
      ],
    ],
  },
  latestPuzzleRating: { value: 2000 },
};

beforeEach(() => {
  vi.clearAllMocks();
});

test("renders AuthWrapper when accessToken is undefined", async () => {
  // Render the component
  render(<LichessApp port={mockPort} gameInfo={mockGameInfo} />);

  // Simulate receiving a message that sets accessToken to undefined
  const listener = mockPort.onMessage.addListener.mock.calls[0][0];

  await act(async () => {
    listener({ action: "GET_LICHESS_ACCESS_TOKEN", payload: undefined });
  });

  await waitFor(() => {
    // Check that the authorization prompt is displayed
    expect(screen.getByText("Lichess Opponent Information")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /authorise with lichess/i })).toBeInTheDocument();
  });
});

test("renders user analytics when accessToken is provided", async () => {
  const mockOpponentNotes = { notes: "Test opponent notes" };

  // Ensure fetchUserAnalytics returns mockUserAnalytics
  api.fetchUserAnalytics.mockResolvedValue(mockUserAnalytics);
  api.fetchOpponentNotes.mockResolvedValue(mockOpponentNotes);

  render(<LichessApp port={mockPort} gameInfo={mockGameInfo} />);

  const listener = mockPort.onMessage.addListener.mock.calls[0][0];

  await act(async () => {
    listener({ action: "GET_LICHESS_ACCESS_TOKEN", payload: { value: "mock-token" } });
  });

  await waitFor(() => {
    expect(api.fetchUserAnalytics).toHaveBeenCalled();
    expect(api.fetchOpponentNotes).toHaveBeenCalled();

    // Check that the analytics data is displayed
    expect(screen.getByText("2000")).toBeInTheDocument(); // Puzzle Rating
    expect(screen.getByText("30.0%")).toBeInTheDocument(); // Disconnects
    expect(screen.getByText("-3")).toBeInTheDocument(); // Losing Streak
    const barCharts = screen.getAllByTestId("bar-chart");
    expect(barCharts.length).toBe(2); // Ensure there are 2 bar charts
    expect(barCharts[0]).toBeInTheDocument(); // Check if the first bar chart is present
    expect(barCharts[1]).toBeInTheDocument(); // Check if the second bar chart is present
    expect(screen.getByTestId("scatter-chart")).toBeInTheDocument(); // Scatter chart is rendered
  });
});
