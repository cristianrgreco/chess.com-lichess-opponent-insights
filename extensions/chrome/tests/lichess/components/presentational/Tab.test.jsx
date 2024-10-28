import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Tab from "@/lichess/components/presentational/Tab";

test("renders with correct active class when it is the current tab", () => {
  const mockSetCurrentTab = vi.fn();
  render(
    <Tab label="Tab1" currentTab="Tab1" setCurrentTab={mockSetCurrentTab}>
      Tab 1 Content
    </Tab>,
  );

  // Expect the tab to have the active class
  const tabElement = screen.getByText("Tab 1 Content");
  expect(tabElement).toHaveClass("ca_tab ca_active");
});

test("renders without active class when it is not the current tab", () => {
  const mockSetCurrentTab = vi.fn();
  render(
    <Tab label="Tab1" currentTab="Tab2" setCurrentTab={mockSetCurrentTab}>
      Tab 1 Content
    </Tab>,
  );

  // Expect the tab to not have the active class
  const tabElement = screen.getByText("Tab 1 Content");
  expect(tabElement).toHaveClass("ca_tab");
  expect(tabElement).not.toHaveClass("ca_active");
});

test("calls setCurrentTab with the correct label when clicked", () => {
  const mockSetCurrentTab = vi.fn();
  render(
    <Tab label="Tab1" currentTab="Tab2" setCurrentTab={mockSetCurrentTab}>
      Tab 1 Content
    </Tab>,
  );

  const tabElement = screen.getByText("Tab 1 Content");
  fireEvent.click(tabElement);

  // Expect setCurrentTab to be called with 'Tab1'
  expect(mockSetCurrentTab).toHaveBeenCalledWith("Tab1");
});

test("applies additional classes if provided", () => {
  const mockSetCurrentTab = vi.fn();
  render(
    <Tab label="Tab1" currentTab="Tab2" setCurrentTab={mockSetCurrentTab} additionalClasses="extra-class">
      Tab 1 Content
    </Tab>,
  );

  const tabElement = screen.getByText("Tab 1 Content");

  // Expect the tab to have the additional class
  expect(tabElement).toHaveClass("ca_tab extra-class");
});

test("renders children correctly", () => {
  const mockSetCurrentTab = vi.fn();
  render(
    <Tab label="Tab1" currentTab="Tab1" setCurrentTab={mockSetCurrentTab}>
      <div data-testid="child-element">Child Content</div>
    </Tab>,
  );

  // Expect the child element to be rendered
  const childElement = screen.getByTestId("child-element");
  expect(childElement).toBeInTheDocument();
  expect(childElement).toHaveTextContent("Child Content");
});
