import {
  ApiError,
  createTodo,
  deleteTodo,
  getTodo,
  getTodos,
  updateTodo,
} from "@/services/api";
import { Todo, TodoCreate, TodoUpdate } from "@/types/todo";

// Mock fetch globally
global.fetch = jest.fn();

describe("API Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockTodo: Todo = {
    id: "1",
    title: "Test Todo",
    completed: false,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

  describe("getTodos", () => {
    it("should fetch all todos successfully", async () => {
      const mockTodos = [mockTodo];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          todos: mockTodos,
          total: 1,
          completed: 0,
        }),
      });

      const result = await getTodos();

      expect(result).toEqual(mockTodos);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/todos"),
      );
    });

    it("should throw ApiError on failed request", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: async () => ({ detail: "Server error" }),
      });

      await expect(getTodos()).rejects.toThrow(ApiError);
      await expect(getTodos()).rejects.toThrow("Server error");
    });
  });

  describe("getTodo", () => {
    it("should fetch a single todo by ID", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTodo,
      });

      const result = await getTodo("1");

      expect(result).toEqual(mockTodo);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/todos/1"),
      );
    });

    it("should throw ApiError when todo not found", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => ({ detail: "Todo not found" }),
      });

      await expect(getTodo("999")).rejects.toThrow(ApiError);
    });
  });

  describe("createTodo", () => {
    it("should create a new todo", async () => {
      const newTodoData: TodoCreate = {
        title: "New Todo",
        completed: false,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTodo,
      });

      const result = await createTodo(newTodoData);

      expect(result).toEqual(mockTodo);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/todos"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newTodoData),
        }),
      );
    });

    it("should throw ApiError on validation failure", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: "Unprocessable Entity",
        json: async () => ({ detail: "Title is required" }),
      });

      await expect(createTodo({ title: "" })).rejects.toThrow(ApiError);
    });
  });

  describe("updateTodo", () => {
    it("should update an existing todo", async () => {
      const updateData: TodoUpdate = {
        title: "Updated Todo",
        completed: true,
      };

      const updatedTodo = { ...mockTodo, ...updateData };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedTodo,
      });

      const result = await updateTodo("1", updateData);

      expect(result).toEqual(updatedTodo);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/todos/1"),
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        }),
      );
    });
  });

  describe("deleteTodo", () => {
    it("should delete a todo", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await expect(deleteTodo("1")).resolves.toBeUndefined();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/todos/1"),
        expect.objectContaining({
          method: "DELETE",
        }),
      );
    });

    it("should throw ApiError when delete fails", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => ({ detail: "Todo not found" }),
      });

      await expect(deleteTodo("999")).rejects.toThrow(ApiError);
    });
  });
});
