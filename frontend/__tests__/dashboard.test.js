import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Dashboard from "../pages/dashboard";

// Mock the next/router behavior cleanly
const mockPush = jest.fn();
jest.mock("next/router", () => ({
  useRouter() { return { push: mockPush }; },
}));

// Mock out the layout sidebar wrapper
jest.mock("../components/Sidebar", () => {
  return function MockSidebar() { return <div data-testid="mock-sidebar">Sidebar</div>; };
});

// Mock apiFetch directly to supply data structures cleanly
const mockApiFetch = jest.fn();
jest.mock("../utils/apiFetch", () => {
  return {
    __esModule: true,
    default: (...args) => mockApiFetch(...args),
  };
});

describe("Dashboard Telemetry Performance Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders login warning layout element for guest users", () => {
    render(<Dashboard authHeader={null} onLogout={jest.fn()} setGlobalError={jest.fn()} />);
    expect(screen.getByText(/please log in to save your learning metrics/i)).toBeInTheDocument();
    
    fireEvent.click(screen.getByRole("button", { name: /go to login/i }));
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  test("displays live activity data streams upon successful API response load", async () => {
    const mockMessages = [
      { _id: "m1", text: "How do APIs protect metrics data?", isUser: true, createdAt: "2026-06-11T20:00:00.000Z" }
    ];
    
    // Match the exact properties mapped in dashboard.js: data.messages and data.totalCount
    mockApiFetch.mockResolvedValueOnce({ 
      messages: mockMessages,
      totalCount: 2
    });

    render(<Dashboard authHeader="Bearer token-abc" onLogout={jest.fn()} setGlobalError={jest.fn()} />);
    
    // Verify the initial rendering loader state
    expect(screen.getByText(/loading your telemetry runtime data/i)).toBeInTheDocument();

    // Verify that the component displays both the total count title and your specific prompt stream
    await waitFor(() => {
      expect(screen.getByText(/Total Q&A Sets Saved: 1/i)).toBeInTheDocument();
      expect(screen.getByText(/How do APIs protect metrics data\?/i)).toBeInTheDocument();
    });
  });
});