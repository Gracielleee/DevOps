import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MaterialsPage from "pages/materials";
import apiFetch from "utils/apiFetch";
import useSubjects from "hooks/useSubjects";

jest.mock("next/router", () => ({ useRouter() { return { push: jest.fn() }; } }));
jest.mock("components/Sidebar", () => { return function Mock() { return <div>Sidebar</div>; }; });
jest.mock("utils/apiFetch", () => jest.fn());
jest.mock("hooks/useSubjects", () => jest.fn());

describe("Materials Repository CRUD Suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.confirm = jest.fn(() => true);
    useSubjects.mockReturnValue({ subjectsList: [{ id: "sub-1", name: "Java Architecture" }], loadingSubjects: false });
  });

  test("pulls and populates existing database entries safely", async () => {
    apiFetch.mockResolvedValueOnce([{ id: "mat-1", topic: "Spring Boot Tutorial", content: "Dependency Injection patterns.", subject: "sub-1" }]);
    render(<MaterialsPage authHeader="Bearer jwt" onLogout={jest.fn()} setGlobalError={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("Spring Boot Tutorial")).toBeInTheDocument();
    });
  });

  test("commits structural POST payloads when form executes completely", async () => {
    apiFetch.mockResolvedValueOnce([]).mockResolvedValueOnce({ id: "mat-2" });
    render(<MaterialsPage authHeader="Bearer jwt" onLogout={jest.fn()} setGlobalError={jest.fn()} />);

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "sub-1" } });
    fireEvent.change(screen.getByPlaceholderText(/week 3 container tuning specs/i), { target: { value: "SQL Tuning" } });
    fireEvent.change(screen.getByPlaceholderText(/provide summary context logs here/i), { target: { value: "Index optimization models." } });
    fireEvent.click(screen.getByRole("button", { name: /commit entry/i }));

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith("materials", expect.objectContaining({ method: "POST" }));
    });
  });
});
