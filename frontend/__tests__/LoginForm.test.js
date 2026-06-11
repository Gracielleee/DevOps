import { render, screen, fireEvent } from "@testing-library/react";
import LoginForm from "../components/LoginForm";

describe("Frontend LoginForm Tests", () => {
  test("renders empty login fields correctly", () => {
    render(<LoginForm onLogin={jest.fn()} error={null} />);
    expect(screen.getByRole("heading", { name: /login to brainbytes ai tutor/i })).toBeInTheDocument();
  });

  test("calls onLogin with input details upon successful form entry", () => {
    const mockLogin = jest.fn();
    render(<LoginForm onLogin={mockLogin} error={null} />);
    
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: "Maureen" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "pass123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(mockLogin).toHaveBeenCalledWith({ username: "Maureen", password: "pass123" });
  });

  test("triggers custom local intercept error when form inputs are blank", () => {
    const mockLogin = jest.fn();
    render(<LoginForm onLogin={mockLogin} error={null} />);
    
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
    expect(mockLogin).toHaveBeenCalledWith(null, "Please enter both username and password.");
  });

  test("displays error banner component when error prop is populated", () => {
    render(<LoginForm onLogin={jest.fn()} error="Database timeout error" />);
    expect(screen.getByText("Database timeout error")).toBeInTheDocument();
  });
});