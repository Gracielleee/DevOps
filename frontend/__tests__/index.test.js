import { render, screen } from "@testing-library/react";
import IndexPage from "../pages/index";

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
jest.mock("../components/Sidebar", () => () => <div data-testid="sidebar">Sidebar</div>);
jest.mock("../utils/formatMath", () => (text) => text);
jest.mock("../utils/apiFetch", () => jest.fn());

describe("Main Core Index Page Chat Tests", () => {
  beforeAll(() => {
    // Provide a mock implementation of scrollIntoView since jsdom doesn't support layout engines
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  test("renders chatbot layout platform interface successfully", () => {
    render(<IndexPage authHeader={null} onLogout={jest.fn()} setGlobalError={jest.fn()} />);
    
    // Assert against the exact text nodes present in your page code
    expect(screen.getByText("BrainBytes AI Tutor")).toBeInTheDocument();
    expect(screen.getByText(/You are using our service as a Guest user/i)).toBeInTheDocument();
  });
});