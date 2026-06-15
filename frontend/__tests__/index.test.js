import { render, screen, waitFor } from "@testing-library/react";
import IndexPage from "pages/index";

// 1. Mock out react-markdown to intercept parsing engines entirely
jest.mock("react-markdown", () => {
  return function MockMarkdown({ children }) {
    return <div data-testid="mock-markdown">{children}</div>;
  };
});

// 2. Mock out every single text syntax package imported by index.js
jest.mock("remark-gfm", () => ({}));
jest.mock("remark-breaks", () => ({}));
jest.mock("remark-math", () => ({}));
jest.mock("rehype-katex", () => ({}));
jest.mock("rehype-highlight", () => ({}));

// 3. Mock internal application modules and components
jest.mock("components/Sidebar", () => () => <div data-testid="sidebar">Sidebar</div>);
jest.mock("utils/formatMath", () => (text) => text);
jest.mock("utils/apiFetch", () => jest.fn(() => Promise.resolve({ data: [] }))); // Mock apiFetch to return an empty array smoothly

describe("Main Core Index Page Chat Tests", () => {
  beforeAll(() => {
    // Provide a mock implementation of scrollIntoView since jsdom doesn't support layout engines
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  test("renders chatbot layout platform interface successfully", async () => {
    render(<IndexPage authHeader={null} onLogout={jest.fn()} setGlobalError={jest.fn()} />);
    
    expect(screen.getByText(/BrainBytes/i)).toBeInTheDocument();
    expect(screen.getByText(/Guest user/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  });
});