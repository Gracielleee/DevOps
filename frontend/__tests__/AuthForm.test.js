import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AuthForm from "../components/AuthForm";

process.env.NEXT_PUBLIC_API_URL = "http://localhost:5000/api/";

const mockPush = jest.fn();
jest.mock("next/router", () => ({
  useRouter() { return { push: mockPush }; },
}));

jest.mock("../components/Toast", () => {
  return function MockToast({ message }) { 
    return <div data-testid="mock-toast">{message}</div>; 
  };
});

describe("Frontend AuthForm Tests", () => {
  let fetchMock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Establish a unique, fresh mock instance tracking system for every single block
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  test("renders login form correctly with fields and placeholder text", () => {
    render(<AuthForm mode="login" onLoginSuccess={jest.fn()} />);
    expect(screen.getByText("Welcome Back!")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/username/i)).not.toBeInTheDocument();
  });

  test("allows user to input values into login fields", () => {
    render(<AuthForm mode="login" onLoginSuccess={jest.fn()} />);
    
    const emailInput = screen.getByText("Email Address").nextSibling;
    fireEvent.change(emailInput, { target: { value: "student@uae.ae" } });
    expect(emailInput.value).toBe("student@uae.ae");
  });

  test("successfully processes login and invokes success properties", async () => {
    const mockLoginSuccess = jest.fn();
    
    // Bind directly to the local instance reference
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: "mocked-jwt-token-xyz" }),
      })
    );

    render(<AuthForm mode="login" onLoginSuccess={mockLoginSuccess} />);
    
    const emailInput = screen.getByText("Email Address").nextSibling;
    const passwordInput = screen.getByText("Password").nextSibling;

    fireEvent.change(emailInput, { target: { value: "test@domain.com" } });
    fireEvent.change(passwordInput, { target: { value: "securepass" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLoginSuccess).toHaveBeenCalledWith("mocked-jwt-token-xyz");
      expect(screen.getByTestId("mock-toast")).toHaveTextContent(/login successful/i);
    });
  });

  test("handles API errors gracefully and displays custom message notification", async () => {
    // Force a complete clearance of anything holding onto fetchMock pipelines
    fetchMock.mockClear();
    
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: "Invalid credentials provided" }),
      })
    );

    render(<AuthForm mode="login" onLoginSuccess={jest.fn()} />);
    
    const emailInput = screen.getByText("Email Address").nextSibling;
    const passwordInput = screen.getByText("Password").nextSibling;

    fireEvent.change(emailInput, { target: { value: "wrong@domain.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpass" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByTestId("mock-toast")).toHaveTextContent("Invalid credentials provided");
    });
  });
});

