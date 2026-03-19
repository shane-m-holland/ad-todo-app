import { TodoForm } from "@/components/TodoForm";
import * as queries from "@/services/queries";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock the queries
jest.mock("@/services/queries");

const mockUseCreateTodo = queries.useCreateTodo as jest.MockedFunction<
  typeof queries.useCreateTodo
>;

describe("TodoForm", () => {
  let queryClient: QueryClient;

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

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TodoForm />
      </QueryClientProvider>,
    );
  };

  it("should render the form with input and button", () => {
    const mockMutate = jest.fn();
    mockUseCreateTodo.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    renderComponent();

    expect(
      screen.getByPlaceholderText(/what needs to be done/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add todo/i }),
    ).toBeInTheDocument();
  });

  it("should submit a new todo when form is filled", async () => {
    const user = userEvent.setup();
    const mockMutate = jest.fn((data, options) => {
      options?.onSuccess?.();
    });

    mockUseCreateTodo.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    renderComponent();

    const input = screen.getByPlaceholderText(/what needs to be done/i);
    const button = screen.getByRole("button", { name: /add todo/i });

    await user.type(input, "New test todo");
    await user.click(button);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New test todo",
          completed: false,
        }),
        expect.any(Object),
      );
    });
  });

  it("should show validation error for empty title", async () => {
    const user = userEvent.setup();
    const mockMutate = jest.fn();

    mockUseCreateTodo.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    renderComponent();

    const button = screen.getByRole("button", { name: /add todo/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/todo title is required/i)).toBeInTheDocument();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("should show validation error for whitespace-only title", async () => {
    const user = userEvent.setup();
    const mockMutate = jest.fn();

    mockUseCreateTodo.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    renderComponent();

    const input = screen.getByPlaceholderText(/what needs to be done/i);
    const button = screen.getByRole("button", { name: /add todo/i });

    await user.type(input, "   ");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/title cannot be empty/i)).toBeInTheDocument();
    });
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("should clear form after successful submission", async () => {
    const user = userEvent.setup();
    const mockMutate = jest.fn((data, options) => {
      options?.onSuccess?.();
    });

    mockUseCreateTodo.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    renderComponent();

    const input = screen.getByPlaceholderText(
      /what needs to be done/i,
    ) as HTMLInputElement;
    const button = screen.getByRole("button", { name: /add todo/i });

    await user.type(input, "New todo");
    await user.click(button);

    await waitFor(() => {
      expect(input.value).toBe("");
    });
  });

  it("should show success message after creation", async () => {
    const user = userEvent.setup();
    const mockMutate = jest.fn((data, options) => {
      options?.onSuccess?.();
    });

    mockUseCreateTodo.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    renderComponent();

    const input = screen.getByPlaceholderText(/what needs to be done/i);
    const button = screen.getByRole("button", { name: /add todo/i });

    await user.type(input, "New todo");
    await user.click(button);

    await waitFor(() => {
      expect(
        screen.getByText(/todo created successfully/i),
      ).toBeInTheDocument();
    });
  });

  it("should show error message on creation failure", async () => {
    const user = userEvent.setup();
    const mockMutate = jest.fn((data, options) => {
      options?.onError?.(new Error("Network error"));
    });

    mockUseCreateTodo.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any);

    renderComponent();

    const input = screen.getByPlaceholderText(/what needs to be done/i);
    const button = screen.getByRole("button", { name: /add todo/i });

    await user.type(input, "New todo");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it("should disable button and input while submitting", async () => {
    const mockMutate = jest.fn();

    mockUseCreateTodo.mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    } as any);

    renderComponent();

    const input = screen.getByPlaceholderText(/what needs to be done/i);
    const button = screen.getByRole("button", { name: /adding/i });

    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
  });
});
