"use client";

import { useTodos } from "@/services/queries";
import { AnimatePresence } from "framer-motion";
import { TodoItem } from "./TodoItem";

/**
 * Component for displaying a list of all todo items.
 * Handles loading and error states, and renders individual TodoItem components.
 */
export function TodoList() {
  const { data: todos, isLoading, error } = useTodos();

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-8 text-center shadow-sm">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading todos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-700 p-8 text-center shadow-sm">
          <svg
            className="mx-auto h-12 w-12 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-red-900 dark:text-red-300">
            Error loading todos
          </h3>
          <p className="mt-2 text-red-700 dark:text-red-400">
            {error instanceof Error
              ? error.message
              : "An unknown error occurred"}
          </p>
        </div>
      </div>
    );
  }

  if (!todos || todos.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-8 text-center shadow-sm">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            No todos yet
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Get started by adding your first todo above!
          </p>
        </div>
      </div>
    );
  }

  // Separate completed and incomplete todos
  const incompleteTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Total: <strong className="text-gray-900 dark:text-gray-100">{todos.length}</strong>
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            Active:{" "}
            <strong className="text-primary-600 dark:text-primary-400">
              {incompleteTodos.length}
            </strong>
          </span>
          <span className="text-gray-600 dark:text-gray-400">
            Completed:{" "}
            <strong className="text-green-600 dark:text-green-400">{completedTodos.length}</strong>
          </span>
        </div>
      </div>

      {/* Incomplete todos */}
      {incompleteTodos.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Active Tasks</h2>
          <AnimatePresence mode="popLayout">
            {incompleteTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Completed todos */}
      {completedTodos.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Completed</h2>
          <AnimatePresence mode="popLayout">
            {completedTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
