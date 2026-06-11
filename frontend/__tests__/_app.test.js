import { render, screen, fireEvent } from "@testing-library/react";
import App from "../pages/_app";

const DummyComponent = ({ authHeader, onLoginSuccess, setGlobalError }) => (
  <div>
    <div data-testid="auth-state">{authHeader || "No Token"}</div>
    <button onClick={() => onLoginSuccess("new-token-123")}>Mock Login</button>
    <button onClick={() => setGlobalError("Global Failure Intercepted")}>Mock Error</button>
  </div>
);

jest.mock("../components/Toast", () => {
  return function MockToast({ message }) {
    return <div data-testid="global-toast">{message}</div>;
  };
});

describe("Root App Architecture Tests", () => {
  beforeEach(() => {
    Object.setPrototypeOf(global.localStorage, {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    });
    jest.clearAllMocks();
  });

  test("reads token on mount and distributes bearer credentials", () => {
    global.localStorage.getItem.mockReturnValueOnce("initial-jwt-xyz");
    render(<App Component={DummyComponent} pageProps={{}} />);
    expect(screen.getByTestId("auth-state")).toHaveTextContent("Bearer initial-jwt-xyz");
  });

  test("handles login success by updating storage and credentials", () => {
    global.localStorage.getItem.mockReturnValueOnce(null);
    render(<App Component={DummyComponent} pageProps={{}} />);
    
    fireEvent.click(screen.getByRole("button", { name: /mock login/i }));
    expect(global.localStorage.setItem).toHaveBeenCalledWith("token", "new-token-123");
    expect(screen.getByTestId("auth-state")).toHaveTextContent("Bearer new-token-123");
  });

  test("intercepts bubbling errors and displays global toast alert", () => {
    global.localStorage.getItem.mockReturnValueOnce(null);
    render(<App Component={DummyComponent} pageProps={{}} />);
    
    fireEvent.click(screen.getByRole("button", { name: /mock error/i }));
    expect(screen.getByTestId("global-toast")).toHaveTextContent("Global Failure Intercepted");
  });
});