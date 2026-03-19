/**
 * Helper script to clear the database before running e2e tests.
 * This ensures tests start with a clean slate and don't interfere with each other.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function clearDatabase() {
  try {
    // Fetch all todos
    const response = await fetch(`${API_URL}/api/v1/todos`);
    const data = await response.json();

    // Delete each todo
    if (data.todos && Array.isArray(data.todos)) {
      await Promise.all(
        data.todos.map((todo: { id: string }) =>
          fetch(`${API_URL}/api/v1/todos/${todo.id}`, {
            method: "DELETE",
          }),
        ),
      );
    }

    console.log(`✓ Cleared ${data.todos?.length || 0} todos from database`);
    return true;
  } catch (error) {
    console.error("Failed to clear database:", error);
    return false;
  }
}
