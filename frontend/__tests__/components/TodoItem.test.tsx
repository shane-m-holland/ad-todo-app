import { TodoItem } from "@/components/TodoItem";
import * as queries from "@/services/queries";
import { Todo } from "@/types/todo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock the queries
jest.mock("@/services/queries");

const mockUseUpdateTodo = queries.useUpdateTodo as jest.MockedFunction<
  typeof queries.useUpdateTodo
>;
const mockUseDeleteTodo = queries.useDeleteTodo as jest.MockedFunction<
  typeof queries.useDeleteTodo
>;

describe("TodoItem", () => {
  let queryClient: QueryClient;

  const mockTodo: Todo = {
    id: "1",
    title: "Test Todo",
    completed: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (todo: Todo = mockTodo) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TodoItem todo={todo} />
      </QueryClientProvider>,
    );
  };

  it("should render todo item with title", () => {
    const mockUpdateMutate = jest.fn();
    const mockDeleteMutate = jest.fn();

    mockUseUpdateTodo.mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
    } as any);
    mockUseDeleteTodo.mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as any);

    renderComponent();

    expect(screen.getByText("Test Todo")).toBeInTheDocument();
  });

  it("should toggle completion status when checkbox is clicked", async () => {
    const user = userEvent.setup();
    const mockUpdateMutate = jest.fn();
    const mockDeleteMutate = jest.fn();

    mockUseUpdateTodo.mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
    } as any);
    mockUseDeleteTodo.mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as any);

    renderComponent();

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(mockUpdateMutate).toHaveBeenCalledWith({
      id: "1",
      data: { completed: true },
    });
  });

  it("should enter edit mode when edit button is clicked", async () => {
    const user = userEvent.setup();
    const mockUpdateMutate = jest.fn();
    const mockDeleteMutate = jest.fn();

    mockUseUpdateTodo.mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
    } as any);
    mockUseDeleteTodo.mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as any);

    renderComponent();

    const editButton = screen.getByRole("button", { name: /edit/i });
    await user.click(editButton);

    const input = screen.getByDisplayValue("Test Todo");
    expect(input).toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  it("should save edited title when input loses focus", async () => {
    const user = userEvent.setup();
    const mockUpdateMutate = jest.fn((data, options) => {
      options?.onSuccess?.();
    });
    const mockDeleteMutate = jest.fn();

    mockUseUpdateTodo.mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
    } as any);
    mockUseDeleteTodo.mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as any);

    renderComponent();

    const editButton = screen.getByRole("button", { name: /edit/i });
    await user.click(editButton);

    const input = screen.getByDisplayValue("Test Todo");
    await user.clear(input);
    await user.type(input, "Updated Todo");
    await user.tab(); // Trigger blur

    await waitFor(() => {
      expect(mockUpdateMutate).toHaveBeenCalledWith(
        {
          id: "1",
          data: { title: "Updated Todo" },
        },
        expect.any(Object),
      );
    });
  });

  it("should cancel edit when Escape key is pressed", async () => {
    const user = userEvent.setup();
    const mockUpdateMutate = jest.fn();
    const mockDeleteMutate = jest.fn();

    mockUseUpdateTodo.mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
    } as any);
    mockUseDeleteTodo.mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as any);

    renderComponent();

    const editButton = screen.getByRole("button", { name: /edit/i });
    await user.click(editButton);

    const input = screen.getByDisplayValue("Test Todo");
    await user.clear(input);
    await user.type(input, "Changed{Escape}");

    await waitFor(() => {
      expect(screen.getByText("Test Todo")).toBeInTheDocument();
      expect(mockUpdateMutate).not.toHaveBeenCalled();
    });
  });

  it("should delete todo when delete button is clicked", async () => {
    const user = userEvent.setup();
    const mockUpdateMutate = jest.fn();
    const mockDeleteMutate = jest.fn();

    mockUseUpdateTodo.mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
    } as any);
    mockUseDeleteTodo.mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as any);

    renderComponent();

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    await user.click(deleteButton);

    expect(mockDeleteMutate).toHaveBeenCalledWith("1");
  });

  it("should display completed todo with line-through", () => {
    const mockUpdateMutate = jest.fn();
    const mockDeleteMutate = jest.fn();

    mockUseUpdateTodo.mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
    } as any);
    mockUseDeleteTodo.mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as any);

    const completedTodo = { ...mockTodo, completed: true };
    renderComponent(completedTodo);

    const title = screen.getByText("Test Todo");
    expect(title).toHaveClass("line-through");
  });

  it("should display creation and update dates", () => {
    const mockUpdateMutate = jest.fn();
    const mockDeleteMutate = jest.fn();

    mockUseUpdateTodo.mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
    } as any);
    mockUseDeleteTodo.mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as any);

    renderComponent();

    expect(screen.getByText(/created:/i)).toBeInTheDocument();
  });

  it("should enter edit mode on double click", async () => {
    const user = userEvent.setup();
    const mockUpdateMutate = jest.fn();
    const mockDeleteMutate = jest.fn();

    mockUseUpdateTodo.mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
    } as any);
    mockUseDeleteTodo.mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    } as any);

    renderComponent();

    const title = screen.getByText("Test Todo");
    await user.dblClick(title);

    const input = screen.getByDisplayValue("Test Todo");
    expect(input).toBeInTheDocument();
  });
});
