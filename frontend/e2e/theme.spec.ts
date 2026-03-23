import { expect, test } from "@playwright/test";

test.describe("Theme Toggle", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to start from a known state
    await page.goto("/");
    await page.evaluate(() => localStorage.removeItem("theme"));
    await page.reload();
  });

  test("should display theme toggle button with moon icon in light mode", async ({
    page,
  }) => {
    const toggle = page.getByTestId("theme-toggle");
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-label", "Toggle dark mode");
  });

  test("should switch to dark mode when toggle is clicked", async ({
    page,
  }) => {
    await page.getByTestId("theme-toggle").click();

    // html element should have dark class
    const htmlClass = await page.evaluate(
      () => document.documentElement.className,
    );
    expect(htmlClass).toContain("dark");

    // Button aria-label should update
    await expect(page.getByTestId("theme-toggle")).toHaveAttribute(
      "aria-label",
      "Toggle light mode",
    );
  });

  test("should persist dark mode preference in localStorage", async ({
    page,
  }) => {
    await page.getByTestId("theme-toggle").click();

    const theme = await page.evaluate(() => localStorage.getItem("theme"));
    expect(theme).toBe("dark");
  });

  test("should restore dark mode from localStorage on page reload", async ({
    page,
  }) => {
    // Set dark mode
    await page.getByTestId("theme-toggle").click();

    // Reload page
    await page.reload();

    // html element should still have dark class
    const htmlClass = await page.evaluate(
      () => document.documentElement.className,
    );
    expect(htmlClass).toContain("dark");

    // Toggle button should show sun icon (Toggle light mode)
    await expect(page.getByTestId("theme-toggle")).toHaveAttribute(
      "aria-label",
      "Toggle light mode",
    );
  });

  test("should switch back to light mode and persist the preference", async ({
    page,
  }) => {
    // Switch to dark
    await page.getByTestId("theme-toggle").click();
    // Switch back to light
    await page.getByTestId("theme-toggle").click();

    const theme = await page.evaluate(() => localStorage.getItem("theme"));
    expect(theme).toBe("light");

    const htmlClass = await page.evaluate(
      () => document.documentElement.className,
    );
    expect(htmlClass).not.toContain("dark");

    await expect(page.getByTestId("theme-toggle")).toHaveAttribute(
      "aria-label",
      "Toggle dark mode",
    );
  });

  test("should restore light mode from localStorage on page reload", async ({
    page,
  }) => {
    // Set light explicitly in localStorage
    await page.evaluate(() => localStorage.setItem("theme", "light"));
    await page.reload();

    const htmlClass = await page.evaluate(
      () => document.documentElement.className,
    );
    expect(htmlClass).not.toContain("dark");

    await expect(page.getByTestId("theme-toggle")).toHaveAttribute(
      "aria-label",
      "Toggle dark mode",
    );
  });
});
