import { expect, test } from "@playwright/test";
import { deleteRecentTestTodos } from "./helpers/api";
import { waitForTodoCreation, waitForTodoUpdate } from "./helpers/waiters";

test.describe("Todo App - Error Scenarios", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // Clean up test todos after all tests in this file
  test.afterAll(async () => {
    const deleted = await deleteRecentTestTodos();
    console.log(`✓ Cleaned up ${deleted} test todos`);
  });

  test("should show validation error for empty todo", async ({ page }) => {
    // Try to submit without entering a title
    await page.getByTestId("add-todo-button").click();

    // Verify validation error is shown
    await expect(page.getByText(/todo title is required/i)).toBeVisible();
  });

  test("should show validation error for whitespace-only todo", async ({
    page,
  }) => {
    // Enter only whitespace
    await page.getByTestId("todo-input").fill("   ");
    await page.getByTestId("add-todo-button").click();

    // Verify validation error is shown
    await expect(page.getByText(/title cannot be empty/i)).toBeVisible();
  });

  test("should handle edit cancellation with Escape key", async ({ page }) => {
    const originalTitle = `Original ${Date.now()}`;

    // Create a todo
    await page.getByTestId("todo-input").fill(originalTitle);
    await waitForTodoCreation(
      page,
      async () => {
        await page.getByTestId("add-todo-button").click();
      },
      originalTitle,
    );

    // Get the todo item's ID
    const todoItem = page
      .locator(`[data-testid^="todo-item-"]`)
      .filter({ hasText: originalTitle });
    await expect(todoItem).toBeVisible();

    const testId = await todoItem.getAttribute("data-testid");
    const todoId = testId?.replace("todo-item-", "");

    // Start editing using the Edit button
    await page.getByTestId(`todo-edit-button-${todoId}`).click();

    // Try to change the title but cancel with Escape
    const input = page.getByTestId(`todo-edit-input-${todoId}`);
    await expect(input).toBeVisible();
    await input.fill("Changed Title");
    await input.press("Escape");

    // Small delay for state to update
    await page.waitForTimeout(200);

    // Verify original title is still there
    await expect(page.getByText(originalTitle)).toBeVisible();
    await expect(page.getByText("Changed Title")).not.toBeVisible();
  });

  test("should handle double-click to edit", async ({ page }) => {
    const todoTitle = `Double Click ${Date.now()}`;

    // Create a todo
    await page.getByTestId("todo-input").fill(todoTitle);
    await waitForTodoCreation(
      page,
      async () => {
        await page.getByTestId("add-todo-button").click();
      },
      todoTitle,
    );

    // Get the todo item's ID
    const todoItem = page
      .locator(`[data-testid^="todo-item-"]`)
      .filter({ hasText: todoTitle });
    await expect(todoItem).toBeVisible();

    const testId = await todoItem.getAttribute("data-testid");
    const todoId = testId?.replace("todo-item-", "");

    // Double-click the todo title
    await page.getByTestId(`todo-title-${todoId}`).dblclick();

    // Verify edit mode is activated - there should be an input with the value
    const input = page.getByTestId(`todo-edit-input-${todoId}`);
    await expect(input).toBeVisible();
    await expect(input).toBeFocused();
    await expect(input).toHaveValue(todoTitle);
  });

  test("should not save edit if title is unchanged", async ({ page }) => {
    const originalTitle = `Unchanged ${Date.now()}`;

    // Create a todo
    await page.getByTestId("todo-input").fill(originalTitle);
    await waitForTodoCreation(
      page,
      async () => {
        await page.getByTestId("add-todo-button").click();
      },
      originalTitle,
    );

    // Get the todo item's ID
    const todoItem = page
      .locator(`[data-testid^="todo-item-"]`)
      .filter({ hasText: originalTitle });
    await expect(todoItem).toBeVisible();

    const testId = await todoItem.getAttribute("data-testid");
    const todoId = testId?.replace("todo-item-", "");

    // Start editing
    await page.getByTestId(`todo-edit-button-${todoId}`).click();

    // Press Enter without changing
    const input = page.getByTestId(`todo-edit-input-${todoId}`);
    await expect(input).toBeVisible();
    await input.press("Enter");

    // Small delay for state to update (no network request should occur)
    await page.waitForTimeout(200);

    // Verify we're back to view mode with the same title
    await expect(page.getByTestId(`todo-title-${todoId}`)).toBeVisible();
    // The Edit button should be visible again
    await expect(page.getByTestId(`todo-edit-button-${todoId}`)).toBeVisible();
  });

  test("should display timestamps", async ({ page }) => {
    const todoTitle = `Timestamped ${Date.now()}`;

    // Create a todo
    await page.getByTestId("todo-input").fill(todoTitle);
    await waitForTodoCreation(
      page,
      async () => {
        await page.getByTestId("add-todo-button").click();
      },
      todoTitle,
    );

    // Get the todo item's ID
    const todoItem = page
      .locator(`[data-testid^="todo-item-"]`)
      .filter({ hasText: todoTitle });
    await expect(todoItem).toBeVisible();

    const testId = await todoItem.getAttribute("data-testid");
    const todoId = testId?.replace("todo-item-", "");

    // Verify metadata is shown
    const metadata = page.getByTestId(`todo-metadata-${todoId}`);
    await expect(metadata).toBeVisible();
    await expect(metadata).toContainText(/created:/i);
  });

  test("should handle rapid todo creation", async ({ page }) => {
    const todos = [
      `Quick 1 ${Date.now()}`,
      `Quick 2 ${Date.now()}`,
      `Quick 3 ${Date.now()}`,
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

    // Verify all todos were created
    for (const todo of todos) {
      await expect(page.getByText(todo)).toBeVisible();
    }
  });

  test("should handle rapid status toggles", async ({ page }) => {
    const todoTitle = `Toggle Me ${Date.now()}`;

    // Create a todo
    await page.getByTestId("todo-input").fill(todoTitle);
    await waitForTodoCreation(
      page,
      async () => {
        await page.getByTestId("add-todo-button").click();
      },
      todoTitle,
    );

    // Get the todo item's ID
    const todoItem = page
      .locator(`[data-testid^="todo-item-"]`)
      .filter({ hasText: todoTitle });
    await expect(todoItem).toBeVisible();

    const testId = await todoItem.getAttribute("data-testid");
    const todoId = testId?.replace("todo-item-", "");

    // Find the checkbox and title
    const checkbox = page.getByTestId(`todo-checkbox-${todoId}`);
    const todoText = page.getByTestId(`todo-title-${todoId}`);

    // Toggle multiple times, waiting for each update
    await waitForTodoUpdate(page, async () => {
      await checkbox.click();
    });
    await expect(todoText).toHaveClass(/line-through/);

    await waitForTodoUpdate(page, async () => {
      await checkbox.click();
    });
    await expect(todoText).not.toHaveClass(/line-through/);

    await waitForTodoUpdate(page, async () => {
      await checkbox.click();
    });

    // Verify final state is complete (has line-through)
    await expect(todoText).toHaveClass(/line-through/);
  });
});
