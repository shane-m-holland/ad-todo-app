"use client";

import { useCreateTodo } from "@/services/queries";
import { TodoCreate } from "@/types/todo";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface TodoFormData {
  title: string;
}

/**
 * Form component for creating new todo items.
 * Uses React Hook Form for form state management and validation.
 * Displays success/error feedback to the user.
 */
export function TodoForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TodoFormData>();
  const createTodo = useCreateTodo();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  /**
   * Handles form submission to create a new todo.
   *
   * @param data - Form data containing the todo title
   */
  const onSubmit = async (data: TodoFormData) => {
    setFeedback(null);

    const todoData: TodoCreate = {
      title: data.title.trim(),
      completed: false,
    };

    createTodo.mutate(todoData, {
      onSuccess: () => {
        reset();
        setFeedback({
          type: "success",
          message: "Todo created successfully!",
        });
        // Clear success message after 3 seconds
        setTimeout(() => setFeedback(null), 3000);
      },
      onError: (error) => {
        setFeedback({
          type: "error",
          message:
            error instanceof Error ? error.message : "Failed to create todo",
        });
      },
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        data-testid="todo-form"
      >
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="text"
              placeholder="What needs to be done?"
              data-testid="todo-input"
              className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 ${
                errors.title
                  ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20"
                  : "border-gray-200 bg-white dark:border-gray-600"
              }`}
              {...register("title", {
                required: "Todo title is required",
                minLength: {
                  value: 1,
                  message: "Title must be at least 1 character",
                },
                maxLength: {
                  value: 200,
                  message: "Title must be less than 200 characters",
                },
                validate: (value) =>
                  value.trim().length > 0 || "Title cannot be empty",
              })}
              disabled={createTodo.isPending}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">
                {errors.title.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={createTodo.isPending}
            data-testid="add-todo-button"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createTodo.isPending ? "Adding..." : "Add Todo"}
          </button>
        </div>
      </form>

      {/* Feedback messages */}
      {feedback && (
        <div
          className={`mt-4 p-3 rounded-lg animate-slide-in ${
            feedback.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700"
              : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700"
          }`}
          role="alert"
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
}
