import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "../components/Sidebar";

jest.mock("next/router", () => ({
  useRouter() { return { pathname: "/" }; },
}));

describe("Frontend Sidebar Tests", () => {
  test("renders log in option link in guest view", () => {
    render(<Sidebar authHeader={null} onLogout={jest.fn()} />);
    expect(screen.getByRole("link", { name: /🔑 log in/i })).toBeInTheDocument();
  });

  test("renders sign out panel button in authenticated state view", () => {
    render(<Sidebar authHeader="Bearer user-token" onLogout={jest.fn()} />);
    expect(screen.getByRole("button", { name: /🚪 log out/i })).toBeInTheDocument();
  });

  test("triggers onLogout property when sign out link is pressed", () => {
    const mockLogout = jest.fn();
    render(<Sidebar authHeader="Bearer user-token" onLogout={mockLogout} />);
    
    fireEvent.click(screen.getByRole("button", { name: /🚪 log out/i }));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});