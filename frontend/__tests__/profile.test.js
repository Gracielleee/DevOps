import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Profile from "pages/profile";
import apiFetch from "utils/apiFetch";
import useSubjects from "hooks/useSubjects";

jest.mock("components/Sidebar", () => { return function Mock() { return <div>Sidebar</div>; }; });
jest.mock("utils/apiFetch", () => jest.fn());
jest.mock("hooks/useSubjects", () => jest.fn());

describe("Profile Operations Suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSubjects.mockReturnValue({ subjectsList: [{ id: "s1", name: "Data Structures" }], loadingSubjects: false });
  });

  test("disables inputs when a guest user views profile settings", () => {
    render(<Profile authHeader={null} onLogout={jest.fn()} />);
    expect(screen.getByText(/notice:/i)).toBeInTheDocument();
    
    // Select inputs by index position from the form DOM layer tree safely
    const textboxes = screen.getAllByRole("textbox");
    expect(textboxes[0]).toBeDisabled(); // Name field
    expect(textboxes[1]).toBeDisabled(); // Email field
  });

  test("performs profile information data saves using PUT requests", async () => {
    apiFetch
      .mockResolvedValueOnce({ data: { name: "Dev User", email: "dev@test.com", preferredSubject: null } })
      .mockResolvedValueOnce({ name: "Dev User", email: "dev@test.com", preferredSubject: "s1" });

    render(<Profile authHeader="Bearer token" onLogout={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "s1" } });
    fireEvent.click(screen.getByRole("button", { name: /save profile/i }));

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith("profile", expect.objectContaining({ method: "PUT" }));
    });
  });
});