import { ThemeToggle } from "@/components/ThemeToggle";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("ThemeToggle", () => {
  beforeEach(() => {
    // Reset dark class and localStorage before each test
    document.documentElement.classList.remove("dark");
    localStorage.clear();
  });

  afterEach(() => {
    document.documentElement.classList.remove("dark");
    localStorage.clear();
  });

  it("should render the toggle button", () => {
    render(<ThemeToggle />);
    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
  });

  it("should show moon icon with 'Toggle dark mode' aria-label in light mode (default)", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Toggle dark mode");
  });

  it("should not apply dark class to html element in light mode (default)", () => {
    render(<ThemeToggle />);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("should switch to dark mode and update localStorage when clicked", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByTestId("theme-toggle"));

    expect(localStorage.getItem("theme")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("should update aria-label to 'Toggle light mode' after switching to dark mode", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByTestId("theme-toggle"));

    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Toggle light mode",
    );
  });

  it("should switch back to light mode when clicked again", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByTestId("theme-toggle")); // → dark
    await user.click(screen.getByTestId("theme-toggle")); // → light

    expect(localStorage.getItem("theme")).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Toggle dark mode",
    );
  });

  it("should load dark mode from localStorage on mount", () => {
    localStorage.setItem("theme", "dark");
    render(<ThemeToggle />);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Toggle light mode",
    );
  });

  it("should load light mode from localStorage on mount", () => {
    localStorage.setItem("theme", "light");
    render(<ThemeToggle />);

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Toggle dark mode",
    );
  });

  it("should default to light mode when no localStorage value exists", () => {
    render(<ThemeToggle />);

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Toggle dark mode",
    );
  });

  it("should still toggle theme when localStorage throws an error", async () => {
    const user = userEvent.setup();
    const originalSetItem = Storage.prototype.setItem;
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.setItem = () => {
      throw new Error("localStorage unavailable");
    };
    Storage.prototype.getItem = () => {
      throw new Error("localStorage unavailable");
    };

    render(<ThemeToggle />);
    await user.click(screen.getByTestId("theme-toggle"));

    // Theme should still toggle on the DOM even if localStorage fails
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    Storage.prototype.setItem = originalSetItem;
    Storage.prototype.getItem = originalGetItem;
  });
});
