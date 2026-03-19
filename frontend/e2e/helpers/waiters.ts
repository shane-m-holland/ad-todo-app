/**
 * Helper functions for waiting on network activity in e2e tests.
 * These functions ensure tests wait for actual API responses rather than using fixed timeouts.
 */

import { Page } from "@playwright/test";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TODOS_API = `${API_URL}/api/v1/todos`;

/**
 * Wait for a POST request to create a todo and the subsequent GET request to refetch the list.
 * This ensures the new todo actually appears in the UI before continuing the test.
 *
 * @param page - Playwright page object
 * @param action - Function that triggers the creation (e.g., clicking the submit button)
 * @param title - Optional: The title of the todo to wait for in the DOM
 */
export async function waitForTodoCreation(
  page: Page,
  action: () => Promise<void>,
  title?: string,
) {
  const postPromise = page.waitForResponse(
    (resp) =>
      resp.url().includes("/api/v1/todos") &&
      resp.request().method() === "POST",
    { timeout: 10000 },
  );

  // Perform the action
  await action();

  // Wait for POST to complete first
  await postPromise;

  // Now wait for the GET refetch that happens AFTER the invalidation
  // This ensures we're catching the refetch that includes the new todo
  const refetchPromise = page.waitForResponse(
    (resp) =>
      resp.url().includes("/api/v1/todos") && resp.request().method() === "GET",
    { timeout: 10000 },
  );

  await refetchPromise;

  // Important: Give React Query time to process the response and update its cache
  // before we start polling the DOM for the new todo
  await page.waitForTimeout(500);

  // If a title is provided, wait for that specific todo to appear
  if (title) {
    await waitForTodoInDOM(page, title, 10000);
  } else {
    // Otherwise, just wait for React Query + React + Framer Motion processing
    await page.waitForTimeout(700);
  }
}

/**
 * Wait for a PUT/PATCH request to update a todo and the subsequent GET request to refetch.
 *
 * @param page - Playwright page object
 * @param action - Function that triggers the update
 */
export async function waitForTodoUpdate(
  page: Page,
  action: () => Promise<void>,
) {
  const updatePromise = page.waitForResponse(
    (resp) =>
      resp.url().includes("/api/v1/todos") &&
      (resp.request().method() === "PUT" ||
        resp.request().method() === "PATCH"),
    { timeout: 10000 },
  );

  await action();

  // Wait for UPDATE to complete
  await updatePromise;

  // With optimistic updates, the UI is already updated
  // Wait for the refetch to confirm
  const refetchPromise = page.waitForResponse(
    (resp) =>
      resp.url().includes("/api/v1/todos") && resp.request().method() === "GET",
    { timeout: 10000 },
  );

  await refetchPromise;

  // Give React Query time to process and confirm the update
  await page.waitForTimeout(500);
}

/**
 * Wait for a DELETE request to remove a todo and the subsequent GET request to refetch.
 *
 * @param page - Playwright page object
 * @param action - Function that triggers the deletion
 */
export async function waitForTodoDeletion(
  page: Page,
  action: () => Promise<void>,
) {
  const deletePromise = page.waitForResponse(
    (resp) =>
      resp.url().includes("/api/v1/todos") &&
      resp.request().method() === "DELETE",
    { timeout: 10000 },
  );

  await action();

  // Wait for DELETE to complete
  await deletePromise;

  // With optimistic updates, the todo is already removed from UI
  // Wait for the refetch to happen and settle
  const refetchPromise = page.waitForResponse(
    (resp) =>
      resp.url().includes("/api/v1/todos") && resp.request().method() === "GET",
    { timeout: 10000 },
  );

  await refetchPromise;

  // Give React Query time to process the server response and update the UI
  // This ensures the optimistic update is confirmed by the server
  await page.waitForTimeout(500);
}

/**
 * Wait for a todo to appear in the DOM with a specific title.
 * Useful as a fallback or additional check.
 *
 * @param page - Playwright page object
 * @param title - The title of the todo to wait for
 * @param timeout - Maximum time to wait in milliseconds (default: 5000)
 */
export async function waitForTodoInDOM(
  page: Page,
  title: string,
  timeout = 5000,
) {
  await page.waitForFunction(
    (todoTitle) => {
      const items = document.querySelectorAll('[data-testid^="todo-item-"]');
      return Array.from(items).some((item) =>
        item.textContent?.includes(todoTitle),
      );
    },
    title,
    { timeout },
  );
}
