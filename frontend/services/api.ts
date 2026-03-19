import { Todo, TodoCreate, TodoUpdate } from "@/types/todo";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TODOS_ENDPOINT = `${API_URL}/api/v1/todos`;

/**
 * Custom error class for API-related errors.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Handles API responses and throws appropriate errors for non-OK responses.
 *
 * @param response - Fetch API response object
 * @returns Parsed JSON data from the response
 * @throws {ApiError} When the response status is not OK
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    let errorData: unknown;

    try {
      errorData = await response.json();
      if (errorData && typeof errorData === "object" && "detail" in errorData) {
        errorMessage = String(errorData.detail);
      }
    } catch {
      // If parsing fails, use the default error message
    }

    throw new ApiError(errorMessage, response.status, errorData);
  }

  return response.json();
}

/**
 * Fetches all todos from the API.
 *
 * @returns Promise resolving to an array of todo items
 * @throws {ApiError} When the API request fails
 */
export async function getTodos(): Promise<Todo[]> {
  const response = await fetch(TODOS_ENDPOINT);
  const data = await handleResponse<{
    todos: Todo[];
    total: number;
    completed: number;
  }>(response);
  return data.todos;
}

/**
 * Fetches a single todo by ID from the API.
 *
 * @param id - The unique identifier of the todo to fetch
 * @returns Promise resolving to the todo item
 * @throws {ApiError} When the API request fails or todo is not found
 */
export async function getTodo(id: string): Promise<Todo> {
  const response = await fetch(`${TODOS_ENDPOINT}/${id}`);
  return handleResponse<Todo>(response);
}

/**
 * Creates a new todo item via the API.
 *
 * @param data - Todo creation data (title and optional completed status)
 * @returns Promise resolving to the newly created todo item
 * @throws {ApiError} When the API request fails
 */
export async function createTodo(data: TodoCreate): Promise<Todo> {
  const response = await fetch(TODOS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Todo>(response);
}

/**
 * Updates an existing todo item via the API.
 *
 * @param id - The unique identifier of the todo to update
 * @param data - Partial todo data to update (title and/or completed status)
 * @returns Promise resolving to the updated todo item
 * @throws {ApiError} When the API request fails or todo is not found
 */
export async function updateTodo(id: string, data: TodoUpdate): Promise<Todo> {
  const response = await fetch(`${TODOS_ENDPOINT}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Todo>(response);
}

/**
 * Deletes a todo item via the API.
 *
 * @param id - The unique identifier of the todo to delete
 * @returns Promise resolving when the deletion is complete
 * @throws {ApiError} When the API request fails or todo is not found
 */
export async function deleteTodo(id: string): Promise<void> {
  const response = await fetch(`${TODOS_ENDPOINT}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.detail) {
        errorMessage = errorData.detail;
      }
    } catch {
      // If parsing fails, use the default error message
    }
    throw new ApiError(errorMessage, response.status);
  }
}
