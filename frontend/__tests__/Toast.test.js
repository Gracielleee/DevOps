import { render, screen, fireEvent, act } from "@testing-library/react";
import Toast from "../components/Toast";

describe("Frontend Toast Tests", () => {
  beforeEach(() => { jest.useFakeTimers(); });
  afterEach(() => { jest.useRealTimers(); });

  test("returns empty element context when message prop is undefined", () => {
    const { container } = render(<Toast message="" onClose={jest.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  test("renders dynamic warning symbol design layout for error alerts", () => {
    render(<Toast message="Operation failed" type="error" onClose={jest.fn()} />);
    expect(screen.getByText(/⚠️ Operation failed/i)).toBeInTheDocument();
  });

  test("invokes onClose click action handler when clicking cancel icon", () => {
    const mockClose = jest.fn();
    render(<Toast message="Update saved" type="success" onClose={mockClose} />);
    
    fireEvent.click(screen.getByRole("button", { name: "×" }));
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test("automatically routes close action event after running for 4 seconds", () => {
    const mockClose = jest.fn();
    render(<Toast message="Timed notice" type="info" onClose={mockClose} />);
    
    act(() => { jest.advanceTimersByTime(4000); });
    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});