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
      // Directly add the new todo to the cache
      queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (old) => {
        if (!old) return [newTodo];
        return [...old, newTodo];
      });

      // Schedule a background refetch after a delay for eventual consistency
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
      }, 2000);
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
    // Optimistically update the cache before the mutation
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY });

      // Snapshot the previous value for rollback
      const previousTodos = queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY);

      // Optimistically update the todos list
      queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (old) => {
        if (!old) return old;
        return old.map((todo) =>
          todo.id === id ? { ...todo, ...data } : todo,
        );
      });

      // Return context with previous value for rollback
      return { previousTodos };
    },
    // On success, update cache with the authoritative server response
    onSuccess: (updatedTodo) => {
      // Replace the optimistic update with the actual server data
      queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (old) => {
        if (!old) return old;
        return old.map((todo) =>
          todo.id === updatedTodo.id ? updatedTodo : todo,
        );
      });

      // Schedule a background refetch after a delay to catch any other changes
      // This provides eventual consistency without causing race conditions
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
      }, 2000);
    },
    // If mutation fails, rollback to previous value
    onError: (err, variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(TODOS_QUERY_KEY, context.previousTodos);
      }
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
    // Optimistically remove from cache before the mutation
    onMutate: async (id: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: TODOS_QUERY_KEY });

      // Snapshot the previous value for rollback
      const previousTodos = queryClient.getQueryData<Todo[]>(TODOS_QUERY_KEY);

      // Optimistically remove the todo from the list
      queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (old) => {
        if (!old) return old;
        return old.filter((todo) => todo.id !== id);
      });

      // Return context with previous value for rollback
      return { previousTodos };
    },
    // On success, the optimistic update is confirmed - no action needed
    // The todo is already removed from cache
    onSuccess: () => {
      // Schedule a background refetch after a delay for eventual consistency
      // This catches any other changes without causing immediate race conditions
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
      }, 2000);
    },
    // If mutation fails, rollback to previous value
    onError: (err, variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(TODOS_QUERY_KEY, context.previousTodos);
      }
    },
  });
}
