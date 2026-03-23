"use client";

import { useDeleteTodo, useUpdateTodo } from "@/services/queries";
import { Todo } from "@/types/todo";
import { motion } from "framer-motion";
import { useState } from "react";

interface TodoItemProps {
  /** The todo item to display */
  todo: Todo;
}

/**
 * Component for displaying and interacting with a single todo item.
 * Supports toggling completion status, editing the title, and deleting the todo.
 *
 * @param props - Component props
 */
export function TodoItem({ todo }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  /**
   * Toggles the completion status of the todo.
   */
  const handleToggleComplete = () => {
    updateTodo.mutate({
      id: todo.id,
      data: { completed: !todo.completed },
    });
  };

  /**
   * Initiates edit mode for the todo title.
   */
  const handleStartEdit = () => {
    setIsEditing(true);
    setEditTitle(todo.title);
  };

  /**
   * Saves the edited todo title.
   */
  const handleSaveEdit = () => {
    const trimmedTitle = editTitle.trim();
    if (trimmedTitle && trimmedTitle !== todo.title) {
      updateTodo.mutate(
        {
          id: todo.id,
          data: { title: trimmedTitle },
        },
        {
          onSuccess: () => setIsEditing(false),
        },
      );
    } else {
      setIsEditing(false);
      setEditTitle(todo.title);
    }
  };

  /**
   * Cancels editing and reverts to the original title.
   */
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(todo.title);
  };

  /**
   * Handles keyboard events in edit mode.
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  /**
   * Deletes the todo item.
   */
  const handleDelete = () => {
    deleteTodo.mutate(todo.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.15 }}
      className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 hover:border-primary-300 dark:hover:border-primary-600 transition-colors shadow-sm"
      data-testid={`todo-item-${todo.id}`}
    >
      <div className="flex items-center gap-3">
        {/* Checkbox for completion status */}
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggleComplete}
          disabled={updateTodo.isPending || deleteTodo.isPending}
          className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 cursor-pointer disabled:opacity-50"
          aria-label={`Mark "${todo.title}" as ${todo.completed ? "incomplete" : "complete"}`}
          data-testid={`todo-checkbox-${todo.id}`}
        />

        {/* Todo title (editable or display mode) */}
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSaveEdit}
              className="w-full px-2 py-1 border-2 border-primary-500 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
              autoFocus
              disabled={updateTodo.isPending}
              data-testid={`todo-edit-input-${todo.id}`}
            />
          ) : (
            <span
              className={`text-gray-800 dark:text-gray-100 ${
                todo.completed ? "line-through text-gray-400 dark:text-gray-500" : ""
              }`}
              onDoubleClick={handleStartEdit}
              title="Double-click to edit"
              data-testid={`todo-title-${todo.id}`}
            >
              {todo.title}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {!isEditing && (
            <>
              <button
                onClick={handleStartEdit}
                disabled={updateTodo.isPending || deleteTodo.isPending}
                className="px-3 py-1 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:text-primary-400 dark:hover:text-primary-300 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                aria-label={`Edit "${todo.title}"`}
                data-testid={`todo-edit-button-${todo.id}`}
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={updateTodo.isPending || deleteTodo.isPending}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                aria-label={`Delete "${todo.title}"`}
                data-testid={`todo-delete-button-${todo.id}`}
              >
                {deleteTodo.isPending ? "Deleting..." : "Delete"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div
        className="mt-2 text-xs text-gray-500 dark:text-gray-400"
        data-testid={`todo-metadata-${todo.id}`}
      >
        Created: {new Date(todo.created_at).toLocaleDateString()}
        {todo.updated_at !== todo.created_at && (
          <> • Updated: {new Date(todo.updated_at).toLocaleDateString()}</>
        )}
      </div>
    </motion.div>
  );
}
