import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AuthWrapper from "@/lichess/components/AuthWrapper";
import { vi } from "vitest";

// Mock the chrome.runtime.getURL function for the logo
global.chrome = {
  runtime: {
    getURL: vi.fn(() => "/path/to/logo_128x128.png"),
  },
};

test("renders authorization prompt when accessToken is undefined", () => {
  render(<AuthWrapper accessToken={undefined} onClickAuthorise={vi.fn()} />);

  // Check that the authorization prompt is displayed
  expect(screen.getByText("Lichess Opponent Information")).toBeInTheDocument();
  expect(screen.getByText(/this extension uses the/i)).toBeInTheDocument();

  // Check that the Authorise button is present
  expect(screen.getByRole("button", { name: /authorise with lichess/i })).toBeInTheDocument();

  // Check that the Lichess API link is present and has the correct URL
  const apiLink = screen.getByRole("link", { name: /lichess api/i });
  expect(apiLink).toBeInTheDocument();
  expect(apiLink).toHaveAttribute("href", "https://lichess.org/api");
  expect(apiLink).toHaveAttribute("target", "_blank");

  // Check that the logo is rendered with the mocked URL
  const logoImage = screen.getByAltText("Logo");
  expect(logoImage).toBeInTheDocument();
  expect(logoImage).toHaveAttribute("src", "/path/to/logo_128x128.png");
});

test("renders children when accessToken is provided", () => {
  render(
    <AuthWrapper accessToken="mock-access-token" onClickAuthorise={vi.fn()}>
      <div>Authorized Content</div>
    </AuthWrapper>,
  );

  // Check that the children are rendered instead of the authorization prompt
  expect(screen.getByText("Authorized Content")).toBeInTheDocument();
  expect(screen.queryByText("Lichess Opponent Information")).not.toBeInTheDocument();
});

test("calls onClickAuthorise when the button is clicked", () => {
  const mockOnClickAuthorise = vi.fn();
  render(<AuthWrapper accessToken={undefined} onClickAuthorise={mockOnClickAuthorise} />);

  const authoriseButton = screen.getByRole("button", { name: /authorise with lichess/i });
  fireEvent.click(authoriseButton);

  // Check that the onClickAuthorise function was called when the button is clicked
  expect(mockOnClickAuthorise).toHaveBeenCalledTimes(1);
});
