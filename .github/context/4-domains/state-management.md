# State Management Domain

## Overview

Client-side server state management uses React Query (@tanstack/react-query v5). This library handles fetching, caching, synchronizing, and updating server state in React applications. The project uses custom hooks that encapsulate all data fetching logic, providing a clean separation from UI components.

## Architecture

### Query Client Setup

Configured in `app/providers.tsx`:

```typescript
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Prevent refetching on window focus in development
            refetchOnWindowFocus: false,
            // Retry failed requests once
            retry: 1,
            // Consider data fresh for 1 second to reduce unnecessary refetches
            // while still maintaining good data consistency
            staleTime: 1000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

**Configuration Patterns:**

- Create `QueryClient` instance with `useState` (singleton per app instance)
- Set global defaults for all queries
- `refetchOnWindowFocus: false` prevents aggressive refetching during development
- `retry: 1` retries failed requests once for better reliability
- `staleTime: 1000` keeps data fresh for 1 second before marking stale
- Wrap app with `QueryClientProvider`

### Query Key Management

Centralized in `services/queries.ts`:

```typescript
/**
 * Query key for todos list queries.
 */
export const TODOS_QUERY_KEY = ["todos"];
```

**Patterns:**

- Query keys are constants
- Export from the same file as hooks
- Use array format: `["resource"]` or `["resource", id]`
- Enables easy cache invalidation and updates

## Query Hooks (Read Operations)

### List Query Hook

```typescript
import { useQuery } from "@tanstack/react-query";
import { getTodos } from "./api";

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
```

**Patterns:**

- Named `use{Resource}s` for lists
- Use `useQuery` hook from React Query
- Specify `queryKey` for cache identification
- Specify `queryFn` that returns a Promise
- Return the query object directly (includes data, isLoading, error, etc.)

### Usage in Component

```typescript
export function TodoList() {
  const { data: todos, isLoading, error } = useTodos();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {todos?.map(todo => <TodoItem key={todo.id} todo={todo} />)}
    </div>
  );
}
```

### Single Item Query Hook

```typescript
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
```

**Patterns:**

- Include identifier in query key: `[...TODOS_QUERY_KEY, id]`
- Use arrow function for `queryFn` when passing parameters
- Use `enabled` to conditionally fetch (only when id is truthy)

## Mutation Hooks (Write Operations)

### Create Mutation Hook

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTodo } from "./api";

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
```

**Patterns:**

- Named `useCreate{Resource}`, `useUpdate{Resource}`, `useDelete{Resource}`
- Use `useMutation` hook
- Get `queryClient` via `useQueryClient()` hook
- Specify `mutationFn` that performs the operation
- Use `onSuccess` callback to update cache
- Use `setQueryData` to directly update cache (optimistic update)
- Type the cache data: `queryClient.setQueryData<Todo[]>`

### Update Mutation Hook

```typescript
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
```

**Patterns:**

- `mutationFn` accepts object with `id` and `data`
- Update specific item in cached array using `map`
- Replace old item with server response

### Delete Mutation Hook

```typescript
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
    onSuccess: (_data, deletedId) => {
      // Remove the deleted todo from cache
      queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (old) => {
        if (!old) return old;
        return old.filter((todo) => todo.id !== deletedId);
      });
    },
  });
}
```

**Patterns:**

- `onSuccess` receives both response data and mutation variables
- Use second parameter (`deletedId`) to identify which item to remove
- Filter out deleted item from cached array

### Usage in Components

```typescript
export function TodoForm() {
  const createTodo = useCreateTodo();

  const onSubmit = (data: TodoFormData) => {
    const todoData: TodoCreate = {
      title: data.title.trim(),
      completed: false,
    };

    createTodo.mutate(todoData, {
      onSuccess: () => {
        reset();
        setFeedback({ type: "success", message: "Todo created!" });
      },
      onError: (error) => {
        setFeedback({
          type: "error",
          message: error.message,
        });
      },
    });
  };

  // Access mutation state
  const isSubmitting = createTodo.isPending;
}
```

**Patterns:**

- Call `.mutate(data, options)` to trigger mutation
- Pass per-mutation callbacks (onSuccess, onError) as second argument
- Use `isPending` to show loading state
- Use `isError` and `error` to show error state

## Cache Management Strategies

### Direct Cache Updates (Current Approach)

```typescript
onSuccess: (newData) => {
  queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (old) => {
    // Directly update cache with new data
    return [...old, newData];
  });
};
```

**Benefits:**

- Instant UI updates (optimistic)
- No refetching needed
- Better UX (no loading spinners after success)
- Reduces server load

### Alternative: Cache Invalidation

```typescript
onSuccess: () => {
  // Alternative approach: invalidate and refetch
  queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
};
```

**When to use:**

- Cache update logic is complex
- Server may modify data beyond what client sent
- Need to ensure consistency with server

**This project uses direct updates for better UX.**

## API Client Separation

### API Functions (services/api.ts)

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getTodos(): Promise<Todo[]> {
  const response = await fetch(`${API_URL}/api/v1/todos`);
  if (!response.ok) {
    throw new Error("Failed to fetch todos");
  }
  const data = await response.json();
  return data.todos;
}

export async function createTodo(todo: TodoCreate): Promise<Todo> {
  const response = await fetch(`${API_URL}/api/v1/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(todo),
  });
  if (!response.ok) {
    throw new Error("Failed to create todo");
  }
  return response.json();
}
```

**Patterns:**

- API functions are pure functions that return Promises
- Handle HTTP errors by checking `response.ok`
- Throw errors for React Query to catch
- Type the return value
- Use environment variables for API URL

### Separation of Concerns

- **api.ts**: Pure HTTP functions, no React hooks
- **queries.ts**: React Query hooks that use api.ts functions
- **Components**: Use hooks from queries.ts, no direct API calls

## Conventions

1. **Custom Hooks**: Wrap all queries and mutations in custom hooks
2. **Centralized Keys**: Define query keys as constants
3. **Optimistic Updates**: Update cache immediately on success
4. **No Local State**: Don't use useState for server data
5. **Error Handling**: Let React Query handle errors, display in UI
6. **Loading States**: Use isPending/isLoading from query/mutation
7. **API Separation**: API functions separate from React Query hooks
8. **Type Safety**: Type all data, mutations, and cache operations

## Anti-Patterns to Avoid

❌ **Don't use useState for server data**

```typescript
// BAD
const [todos, setTodos] = useState<Todo[]>([]);

useEffect(() => {
  fetch("/api/todos")
    .then((r) => r.json())
    .then((data) => setTodos(data));
}, []);

// GOOD
const { data: todos } = useTodos();
```

❌ **Don't make fetch calls directly in components**

```typescript
// BAD
const TodoList = () => {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetch('/api/todos').then(/* ... */);
  }, []);

// GOOD
const TodoList = () => {
  const { data: todos } = useTodos();
```

❌ **Don't invalidate cache when you can update directly**

```typescript
// LESS OPTIMAL
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });
};

// BETTER
onSuccess: (newTodo) => {
  queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (old) => [...old, newTodo]);
};
```

❌ **Don't forget to type cache data**

```typescript
// BAD
queryClient.setQueryData(TODOS_QUERY_KEY, (old) => /* ... */);

// GOOD
queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (old) => /* ... */);
```

## File Organization

```
services/
  api.ts          # Pure API functions
  queries.ts      # React Query hooks
```

## Summary

State management in this project:

- Centralizes all server state in React Query
- Provides instant UI updates via optimistic cache updates
- Keeps components clean and focused on UI
- Ensures type safety throughout
- Handles loading and error states automatically
- Reduces boilerplate compared to manual state management
