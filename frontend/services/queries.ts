import { Todo, TodoUpdate } from "@/types/todo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTodo, deleteTodo, getTodo, getTodos, updateTodo } from "./api";

/**
 * Query key for todos list queries.
 */
export const TODOS_QUERY_KEY = ["todos"];

/**
 * React Query hook for fetching all todos.
 * Automatically caches and manages the todos list state.
 *
 * @returns Query object with todos data, loading state, and error state
 */
export function useTodos() {
  return useQuery({
    queryKey: TODOS_QUERY_KEY,
    queryFn: getTodos,
  });
}

/**
 * React Query hook for fetching a single todo by ID.
 *
 * @param id - The unique identifier of the todo to fetch
 * @returns Query object with todo data, loading state, and error state
 */
export function useTodo(id: string) {
  return useQuery({
    queryKey: [...TODOS_QUERY_KEY, id],
    queryFn: () => getTodo(id),
    enabled: !!id,
  });
}

/**
 * React Query mutation hook for creating a new todo.
 * Directly adds the created todo to cache to avoid race conditions.
 *
 * @returns Mutation object with mutate function and mutation state
 */
export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTodo,
    onSuccess: (newTodo) => {
      // Optimistically add the new todo to the cache for instant UI update
      // The server has already confirmed the todo was created
      queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (old) => {
        if (!old) return [newTodo];
        return [...old, newTodo];
      });
    },
  });
}

/**
 * React Query mutation hook for updating an existing todo.
 * Uses optimistic updates for instant UI feedback, then syncs with server.
 *
 * @returns Mutation object with mutate function and mutation state
 */
export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TodoUpdate }) =>
      updateTodo(id, data),
    // On success, update cache with server response
    onSuccess: (updatedTodo) => {
      // Update cache with the actual server data
      queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (old) => {
        if (!old) return old;
        return old.map((todo) =>
          todo.id === updatedTodo.id ? updatedTodo : todo,
        );
      });
    },
  });
}

/**
 * React Query mutation hook for deleting a todo.
 * Uses optimistic updates for instant UI feedback, then syncs with server.
 *
 * @returns Mutation object with mutate function and mutation state
 */
export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTodo,
    // On success, remove from cache
    onSuccess: (_data, deletedId) => {
      // Remove the deleted todo from cache
      queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (old) => {
        if (!old) return old;
        return old.filter((todo) => todo.id !== deletedId);
      });
    },
  });
}
