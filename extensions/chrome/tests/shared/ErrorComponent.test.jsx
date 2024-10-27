import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ErrorComponent from "@/shared/components/ErrorComponent";

test("renders the error message when error prop is provided", () => {
  render(<ErrorComponent error="Something went wrong" />);

  // Check that the error message is displayed using data-testid
  const errorMessage = screen.getByTestId("error-message");
  expect(errorMessage).toBeInTheDocument();
  expect(errorMessage).toHaveTextContent("Something went wrong");
  expect(errorMessage).toHaveClass("ca_error_message");
});

test("renders empty error message when error prop is not provided", () => {
  render(<ErrorComponent error={null} />);

  // Use data-testid to find the element and check that it is empty
  const errorMessage = screen.getByTestId("error-message");
  expect(errorMessage).toBeInTheDocument();
  expect(errorMessage).toHaveClass("ca_error_message");
  expect(errorMessage).toBeEmptyDOMElement(); // Ensure the element is empty
});

test("applies correct CSS classes to the error container and message", () => {
  render(<ErrorComponent error="Critical error occurred" />);

  // Check that the container has the correct class
  const errorContainer = screen.getByTestId("error-message").parentElement;
  expect(errorContainer).toHaveClass("ca_error");

  // Check that the error message has the correct class
  const errorMessage = screen.getByTestId("error-message");
  expect(errorMessage).toHaveClass("ca_error_message");
});
