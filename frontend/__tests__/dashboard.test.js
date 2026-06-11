import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Dashboard from "../pages/dashboard";

const mockPush = jest.fn();
jest.mock("next/router", () => ({
  useRouter() { return { push: mockPush }; },
}));

jest.mock("../components/Sidebar", () => {
  return function MockSidebar() { return <div data-testid="mock-sidebar">Sidebar</div>; };
});

describe("Dashboard Telemetry Performance Tests", () => {
  let fetchMock;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock = jest.fn();
    global.fetch = fetchMock;
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:5000/api/";
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
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => mockMessages });

    render(<Dashboard authHeader="Bearer token-abc" onLogout={jest.fn()} setGlobalError={jest.fn()} />);
    expect(screen.getByText(/loading your telemetry runtime data/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Total Q&A Sets Saved: 0/i)).toBeInTheDocument();
      expect(screen.getByText(/How do APIs protect metrics data\?/i)).toBeInTheDocument();
    });
  });
});