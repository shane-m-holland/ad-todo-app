import { TodoList } from "@/components/TodoList";
import * as queries from "@/services/queries";
import { Todo } from "@/types/todo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

// Mock the queries
jest.mock("@/services/queries");
jest.mock("@/components/TodoItem", () => ({
  TodoItem: ({ todo }: { todo: Todo }) => (
    <div data-testid={`todo-${todo.id}`}>{todo.title}</div>
  ),
}));

const mockUseTodos = queries.useTodos as jest.MockedFunction<
  typeof queries.useTodos
>;

describe("TodoList", () => {
  let queryClient: QueryClient;

  const mockTodos: Todo[] = [
    {
      id: "1",
      title: "Active Todo",
      completed: false,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      title: "Completed Todo",
      completed: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  ];

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TodoList />
      </QueryClientProvider>,
    );
  };

  it("should display loading state", () => {
    mockUseTodos.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    renderComponent();

    expect(screen.getByText(/loading todos/i)).toBeInTheDocument();
  });

  it("should display error state", () => {
    const error = new Error("Failed to fetch");
    mockUseTodos.mockReturnValue({
      data: undefined,
      isLoading: false,
      error,
    } as any);

    renderComponent();

    expect(screen.getByText(/error loading todos/i)).toBeInTheDocument();
    expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
  });

  it("should display empty state when no todos", () => {
    mockUseTodos.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    renderComponent();

    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
    expect(
      screen.getByText(/get started by adding your first todo/i),
    ).toBeInTheDocument();
  });

  it("should display todos when data is available", () => {
    mockUseTodos.mockReturnValue({
      data: mockTodos,
      isLoading: false,
      error: null,
    } as any);

    renderComponent();

    expect(screen.getByTestId("todo-1")).toBeInTheDocument();
    expect(screen.getByTestId("todo-2")).toBeInTheDocument();
  });

  it("should display statistics", () => {
    mockUseTodos.mockReturnValue({
      data: mockTodos,
      isLoading: false,
      error: null,
    } as any);

    renderComponent();

    expect(screen.getByText(/total:/i)).toBeInTheDocument();
    expect(screen.getByText(/active:/i)).toBeInTheDocument();
    expect(screen.getByText(/completed:/i)).toBeInTheDocument();
  });

  it("should separate active and completed todos", () => {
    mockUseTodos.mockReturnValue({
      data: mockTodos,
      isLoading: false,
      error: null,
    } as any);

    renderComponent();

    expect(screen.getByText(/active tasks/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /completed/i }),
    ).toBeInTheDocument();
  });

  it("should display correct statistics counts", () => {
    mockUseTodos.mockReturnValue({
      data: mockTodos,
      isLoading: false,
      error: null,
    } as any);

    renderComponent();

    // Check for the count values in the statistics
    const statsSection = screen.getByText(/total:/i).parentElement!;
    expect(statsSection).toHaveTextContent("2"); // Total
    expect(statsSection).toHaveTextContent("1"); // Active and Completed
  });

  it("should not display completed section when all todos are active", () => {
    const activeTodos = [mockTodos[0]];
    mockUseTodos.mockReturnValue({
      data: activeTodos,
      isLoading: false,
      error: null,
    } as any);

    renderComponent();

    expect(screen.getByText(/active tasks/i)).toBeInTheDocument();
    // Should not have the completed section heading
    expect(
      screen.queryByRole("heading", { name: /^completed$/i }),
    ).not.toBeInTheDocument();
  });

  it("should not display active section when all todos are completed", () => {
    const completedTodos = [mockTodos[1]];
    mockUseTodos.mockReturnValue({
      data: completedTodos,
      isLoading: false,
      error: null,
    } as any);

    renderComponent();

    expect(screen.queryByText(/active tasks/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /^completed$/i }),
    ).toBeInTheDocument();
  });
});
