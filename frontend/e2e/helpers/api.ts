/**
 * Helper functions for e2e tests to manage todos and cleanup
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all todos from the API
 */
export async function getAllTodos(): Promise<Todo[]> {
  const response = await fetch(`${API_URL}/api/v1/todos`);
  const data = await response.json();
  return data.todos || [];
}

/**
 * Delete a todo by ID
 */
export async function deleteTodo(id: string): Promise<void> {
  await fetch(`${API_URL}/api/v1/todos/${id}`, {
    method: "DELETE",
  });
}

/**
 * Delete all todos that match a title pattern (for test cleanup)
 */
export async function deleteTestTodos(titlePattern: RegExp): Promise<number> {
  const todos = await getAllTodos();
  const testTodos = todos.filter((todo) => titlePattern.test(todo.title));

  await Promise.all(testTodos.map((todo) => deleteTodo(todo.id)));

  return testTodos.length;
}

/**
 * Delete todos created during the current test run by checking timestamps
 * Deletes todos created within the last minute
 */
export async function deleteRecentTestTodos(): Promise<number> {
  const todos = await getAllTodos();
  const oneMinuteAgo = Date.now() - 60 * 1000;

  const recentTodos = todos.filter((todo) => {
    const createdAt = new Date(todo.created_at).getTime();
    return createdAt > oneMinuteAgo;
  });

  await Promise.all(recentTodos.map((todo) => deleteTodo(todo.id)));

  return recentTodos.length;
}
