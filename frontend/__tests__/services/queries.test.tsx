import * as api from "@/services/api";
import {
  useCreateTodo,
  useDeleteTodo,
  useTodo,
  useTodos,
  useUpdateTodo,
} from "@/services/queries";
import { Todo, TodoCreate, TodoUpdate } from "@/types/todo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";

// Mock the API module
jest.mock("@/services/api");

const mockGetTodos = api.getTodos as jest.MockedFunction<typeof api.getTodos>;
const mockGetTodo = api.getTodo as jest.MockedFunction<typeof api.getTodo>;
const mockCreateTodo = api.createTodo as jest.MockedFunction<
  typeof api.createTodo
>;
const mockUpdateTodo = api.updateTodo as jest.MockedFunction<
  typeof api.updateTodo
>;
const mockDeleteTodo = api.deleteTodo as jest.MockedFunction<
  typeof api.deleteTodo
>;

describe("React Query Hooks", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const mockTodo: Todo = {
    id: "1",
    title: "Test Todo",
    completed: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  describe("useTodos", () => {
    it("should fetch todos successfully", async () => {
      const mockTodos = [mockTodo];
      mockGetTodos.mockResolvedValue(mockTodos);

      const { result } = renderHook(() => useTodos(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockTodos);
      expect(mockGetTodos).toHaveBeenCalledTimes(1);
    });

    it("should handle errors", async () => {
      const error = new Error("Failed to fetch");
      mockGetTodos.mockRejectedValue(error);

      const { result } = renderHook(() => useTodos(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(error);
    });
  });

  describe("useTodo", () => {
    it("should fetch a single todo", async () => {
      mockGetTodo.mockResolvedValue(mockTodo);

      const { result } = renderHook(() => useTodo("1"), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockTodo);
      expect(mockGetTodo).toHaveBeenCalledWith("1");
    });

    it("should not fetch if id is empty", () => {
      const { result } = renderHook(() => useTodo(""), { wrapper });

      expect(result.current.fetchStatus).toBe("idle");
      expect(mockGetTodo).not.toHaveBeenCalled();
    });
  });

  describe("useCreateTodo", () => {
    it("should create a todo", async () => {
      const newTodo: TodoCreate = { title: "New Todo", completed: false };
      mockCreateTodo.mockResolvedValue(mockTodo);

      const { result } = renderHook(() => useCreateTodo(), { wrapper });

      result.current.mutate(newTodo);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockCreateTodo).toHaveBeenCalledWith(newTodo, expect.anything());
      expect(result.current.data).toEqual(mockTodo);
    });

    it("should invalidate queries on success", async () => {
      const newTodo: TodoCreate = { title: "New Todo", completed: false };
      mockCreateTodo.mockResolvedValue(mockTodo);
      mockGetTodos.mockResolvedValue([mockTodo]);

      // First, set up the todos query
      renderHook(() => useTodos(), { wrapper });
      await waitFor(() => expect(mockGetTodos).toHaveBeenCalled());

      const { result } = renderHook(() => useCreateTodo(), { wrapper });

      result.current.mutate(newTodo);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Should refetch todos
      await waitFor(() => expect(mockGetTodos).toHaveBeenCalledTimes(2));
    });
  });

  describe("useUpdateTodo", () => {
    it("should update a todo", async () => {
      const updateData: TodoUpdate = { title: "Updated", completed: true };
      const updatedTodo = { ...mockTodo, ...updateData };
      mockUpdateTodo.mockResolvedValue(updatedTodo);

      const { result } = renderHook(() => useUpdateTodo(), { wrapper });

      result.current.mutate({ id: "1", data: updateData });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockUpdateTodo).toHaveBeenCalledWith("1", updateData);
      expect(result.current.data).toEqual(updatedTodo);
    });

    it("should invalidate queries on success", async () => {
      const updateData: TodoUpdate = { completed: true };
      const updatedTodo = { ...mockTodo, completed: true };
      mockUpdateTodo.mockResolvedValue(updatedTodo);
      mockGetTodos.mockResolvedValue([updatedTodo]);

      // Set up the todos query
      renderHook(() => useTodos(), { wrapper });
      await waitFor(() => expect(mockGetTodos).toHaveBeenCalled());

      const { result } = renderHook(() => useUpdateTodo(), { wrapper });

      result.current.mutate({ id: "1", data: updateData });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Should refetch todos
      await waitFor(() => expect(mockGetTodos).toHaveBeenCalledTimes(2));
    });
  });

  describe("useDeleteTodo", () => {
    it("should delete a todo", async () => {
      mockDeleteTodo.mockResolvedValue();

      const { result } = renderHook(() => useDeleteTodo(), { wrapper });

      result.current.mutate("1");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockDeleteTodo).toHaveBeenCalledWith("1", expect.anything());
    });

    it("should invalidate queries on success", async () => {
      mockDeleteTodo.mockResolvedValue();
      mockGetTodos.mockResolvedValue([]);

      // Set up the todos query
      renderHook(() => useTodos(), { wrapper });
      await waitFor(() => expect(mockGetTodos).toHaveBeenCalled());

      const { result } = renderHook(() => useDeleteTodo(), { wrapper });

      result.current.mutate("1");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Should refetch todos
      await waitFor(() => expect(mockGetTodos).toHaveBeenCalledTimes(2));
    });
  });
});
