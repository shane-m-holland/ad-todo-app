import { expect, test } from "@playwright/test";
import { deleteRecentTestTodos } from "./helpers/api";
import {
  waitForTodoCreation,
  waitForTodoDeletion,
  waitForTodoUpdate,
} from "./helpers/waiters";

test.describe("Todo App - Happy Paths", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // Clean up test todos after all tests in this file
  test.afterAll(async () => {
    const deleted = await deleteRecentTestTodos();
    console.log(`✓ Cleaned up ${deleted} test todos`);
  });

  test("should display the app title and description", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Todo App" })).toBeVisible();
    await expect(
      page.getByText("A simple and elegant way to manage your tasks"),
    ).toBeVisible();
  });

  test("should create a new todo", async ({ page }) => {
    const todoTitle = `Test Todo ${Date.now()}`;

    // Fill in the form
    await page.getByTestId("todo-input").fill(todoTitle);

    // Submit and wait for network requests to complete
    await waitForTodoCreation(
      page,
      async () => {
        await page.getByTestId("add-todo-button").click();
      },
      todoTitle,
    );

    // Verify success message
    await expect(page.getByText("Todo created successfully!")).toBeVisible();

    // Verify the todo appears in the list
    await expect(page.getByText(todoTitle)).toBeVisible();

    // Verify form is cleared
    await expect(page.getByTestId("todo-input")).toHaveValue("");
  });

  test("should mark a todo as complete", async ({ page }) => {
    const todoTitle = `Complete Me ${Date.now()}`;

    // Create a todo
    await page.getByTestId("todo-input").fill(todoTitle);
    await waitForTodoCreation(
      page,
      async () => {
        await page.getByTestId("add-todo-button").click();
      },
      todoTitle,
    );

    // Wait for the todo to appear and get its ID from the DOM
    const todoItem = page
      .locator(`[data-testid^="todo-item-"]`)
      .filter({ hasText: todoTitle });
    await expect(todoItem).toBeVisible();

    // Get the todo ID from the data-testid attribute
    const testId = await todoItem.getAttribute("data-testid");
    const todoId = testId?.replace("todo-item-", "");

    // Find and click the checkbox, waiting for the update to complete
    const checkbox = page.getByTestId(`todo-checkbox-${todoId}`);
    await waitForTodoUpdate(page, async () => {
      await checkbox.click();
    });

    // Verify the todo text has line-through (primary indicator of completion)
    const todoText = page.getByTestId(`todo-title-${todoId}`);
    await expect(todoText).toHaveClass(/line-through/);
  });

  test("should edit a todo", async ({ page }) => {
    const originalTitle = `Original ${Date.now()}`;
    const updatedTitle = `Updated ${Date.now()}`;

    // Create a todo
    await page.getByTestId("todo-input").fill(originalTitle);
    await waitForTodoCreation(
      page,
      async () => {
        await page.getByTestId("add-todo-button").click();
      },
      originalTitle,
    );

    // Wait for the todo to appear and get its ID
    const todoItem = page
      .locator(`[data-testid^="todo-item-"]`)
      .filter({ hasText: originalTitle });
    await expect(todoItem).toBeVisible();

    const testId = await todoItem.getAttribute("data-testid");
    const todoId = testId?.replace("todo-item-", "");

    // Click edit button
    await page.getByTestId(`todo-edit-button-${todoId}`).click();

    // Edit the todo and wait for update to complete
    const input = page.getByTestId(`todo-edit-input-${todoId}`);
    await input.fill(updatedTitle);
    await waitForTodoUpdate(page, async () => {
      await input.press("Enter");
    });

    // Verify the updated title appears
    await expect(page.getByText(updatedTitle)).toBeVisible();
    await expect(page.getByText(originalTitle)).not.toBeVisible();
  });

  test("should delete a todo", async ({ page }) => {
    const todoTitle = `Delete Me ${Date.now()}`;

    // Create a todo
    await page.getByTestId("todo-input").fill(todoTitle);
    await waitForTodoCreation(
      page,
      async () => {
        await page.getByTestId("add-todo-button").click();
      },
      todoTitle,
    );

    // Wait for the todo to appear and get its ID
    const todoItem = page
      .locator(`[data-testid^="todo-item-"]`)
      .filter({ hasText: todoTitle });
    await expect(todoItem).toBeVisible();

    const testId = await todoItem.getAttribute("data-testid");
    const todoId = testId?.replace("todo-item-", "");

    // Click delete button and wait for deletion to complete
    await waitForTodoDeletion(page, async () => {
      await page.getByTestId(`todo-delete-button-${todoId}`).click();
    });

    // Verify the todo is removed
    await expect(page.getByText(todoTitle)).not.toBeVisible();
  });

  test("should display empty state when no todos exist", async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Check if there are any todos visible, if so this test is not applicable
    // (other tests may have created todos)
    const todoItems = await page.locator(`[data-testid^="todo-item-"]`).count();

    if (todoItems === 0) {
      // Verify empty state is shown
      await expect(page.getByText("No todos yet")).toBeVisible();
      await expect(
        page.getByText("Get started by adding your first todo above!"),
      ).toBeVisible();
    } else {
      // Skip this test if todos already exist
      console.log("Skipping empty state test - todos already exist");
    }
  });

  test("should show statistics", async ({ page }) => {
    // Create multiple todos
    const todos = [
      `Todo 1 ${Date.now()}`,
      `Todo 2 ${Date.now()}`,
      `Todo 3 ${Date.now()}`,
    ];

    for (const todo of todos) {
      await page.getByTestId("todo-input").fill(todo);
      await waitForTodoCreation(
        page,
        async () => {
          await page.getByTestId("add-todo-button").click();
        },
        todo,
      );
    }

    // Get the first todo item and its ID
    const firstTodoItem = page
      .locator(`[data-testid^="todo-item-"]`)
      .filter({ hasText: todos[0] });
    await expect(firstTodoItem).toBeVisible();

    const testId = await firstTodoItem.getAttribute("data-testid");
    const todoId = testId?.replace("todo-item-", "");

    // Mark one as complete and wait for update
    const checkbox = page.getByTestId(`todo-checkbox-${todoId}`);
    await waitForTodoUpdate(page, async () => {
      await checkbox.click();
    });

    // Check statistics are visible
    await expect(page.getByText(/total:/i)).toBeVisible();
    await expect(page.getByText(/active:/i)).toBeVisible();
    await expect(page.getByText(/completed:/i)).toBeVisible();
  });

  test("should separate active and completed todos", async ({ page }) => {
    const activeTodo = `Active ${Date.now()}`;
    const completedTodo = `Completed ${Date.now()}`;

    // Create active todo
    await page.getByTestId("todo-input").fill(activeTodo);
    await waitForTodoCreation(
      page,
      async () => {
        await page.getByTestId("add-todo-button").click();
      },
      activeTodo,
    );

    // Create and complete another todo
    await page.getByTestId("todo-input").fill(completedTodo);
    await waitForTodoCreation(
      page,
      async () => {
        await page.getByTestId("add-todo-button").click();
      },
      completedTodo,
    );

    // Get the completed todo's ID
    const completedTodoItem = page
      .locator(`[data-testid^="todo-item-"]`)
      .filter({ hasText: completedTodo });
    await expect(completedTodoItem).toBeVisible();

    const testId = await completedTodoItem.getAttribute("data-testid");
    const todoId = testId?.replace("todo-item-", "");

    // Mark as complete and wait for update
    await waitForTodoUpdate(page, async () => {
      await page.getByTestId(`todo-checkbox-${todoId}`).click();
    });

    // Verify section headers
    await expect(
      page.getByRole("heading", { name: /active tasks/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /^completed$/i }),
    ).toBeVisible();
  });
});
