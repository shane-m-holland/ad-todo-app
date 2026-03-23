"use client";

import { useEffect, useState } from "react";

/**
 * Theme toggle button component for switching between dark and light modes.
 * Persists the user's preference in localStorage and applies the `dark` class
 * to the root HTML element.
 */
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      const theme = localStorage.getItem("theme") || "light";
      const dark = theme === "dark";
      setIsDark(dark);
      document.documentElement.classList.toggle("dark", dark);
    } catch {
      // localStorage may not be available in all environments
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    const newTheme = newIsDark ? "dark" : "light";
    try {
      localStorage.setItem("theme", newTheme);
    } catch {
      // localStorage may not be available in all environments
    }
    document.documentElement.classList.toggle("dark", newIsDark);
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Toggle light mode" : "Toggle dark mode"}
      data-testid="theme-toggle"
      className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
    >
      {isDark ? (
        /* Sun icon – shown in dark mode to indicate switching to light */
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        /* Moon icon – shown in light mode to indicate switching to dark */
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}
