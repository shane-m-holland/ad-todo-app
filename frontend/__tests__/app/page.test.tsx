import Home from "@/app/page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

// Mock the components
jest.mock("@/components/TodoForm", () => ({
  TodoForm: () => <div data-testid="todo-form">TodoForm</div>,
}));

jest.mock("@/components/TodoList", () => ({
  TodoList: () => <div data-testid="todo-list">TodoList</div>,
}));

describe("Home Page", () => {
  const renderComponent = () => {
    const queryClient = new QueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <Home />
      </QueryClientProvider>,
    );
  };

  it("should render the page title", () => {
    renderComponent();
    expect(screen.getByText("Todo App")).toBeInTheDocument();
  });

  it("should render the page description", () => {
    renderComponent();
    expect(
      screen.getByText(/a simple and elegant way to manage your tasks/i),
    ).toBeInTheDocument();
  });

  it("should render TodoForm component", () => {
    renderComponent();
    expect(screen.getByTestId("todo-form")).toBeInTheDocument();
  });

  it("should render TodoList component", () => {
    renderComponent();
    expect(screen.getByTestId("todo-list")).toBeInTheDocument();
  });

  it("should have proper semantic HTML structure", () => {
    renderComponent();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /todo app/i }),
    ).toBeInTheDocument();
  });
});
