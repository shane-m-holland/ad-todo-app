# React Query Hooks Style Guide

## Overview

React Query hooks encapsulate all data fetching logic using @tanstack/react-query. Hooks provide queries for reading and mutations for writing data.

## File Location

- Path: `frontend/services/queries.ts`
- Example: `frontend/services/queries.ts`

## File Structure Template

```typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { get{Resources}, get{Resource}, create{Resource}, update{Resource}, delete{Resource} } from "./api";
import { {Resource}, {Resource}Update } from "@/types/{resource}";

/**
 * Query key for {resources} queries.
 */
export const {RESOURCES}_QUERY_KEY = ["{resources}"];

/**
 * React Query hook for fetching all {resources}.
 */
export function use{Resources}() {
  return useQuery({
    queryKey: {RESOURCES}_QUERY_KEY,
    queryFn: get{Resources},
  });
}

/**
 * React Query hook for fetching a single {resource}.
 */
export function use{Resource}(id: string) {
  return useQuery({
    queryKey: [...{RESOURCES}_QUERY_KEY, id],
    queryFn: () => get{Resource}(id),
    enabled: !!id,
  });
}

/**
 * React Query mutation hook for creating a {resource}.
 */
export function useCreate{Resource}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: create{Resource},
    onSuccess: (new{Resource}) => {
      queryClient.setQueryData<{Resource}[]>({RESOURCES}_QUERY_KEY, (old) => {
        if (!old) return [new{Resource}];
        return [...old, new{Resource}];
      });
    },
  });
}

/**
 * React Query mutation hook for updating a {resource}.
 */
export function useUpdate{Resource}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: {Resource}Update }) =>
      update{Resource}(id, data),
    onSuccess: (updated{Resource}) => {
      queryClient.setQueryData<{Resource}[]>({RESOURCES}_QUERY_KEY, (old) => {
        if (!old) return old;
        return old.map((item) =>
          item.id === updated{Resource}.id ? updated{Resource} : item,
        );
      });
    },
  });
}

/**
 * React Query mutation hook for deleting a {resource}.
 */
export function useDelete{Resource}() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: delete{Resource},
    onSuccess: (_data, deletedId) => {
      queryClient.setQueryData<{Resource}[]>({RESOURCES}_QUERY_KEY, (old) => {
        if (!old) return old;
        return old.filter((item) => item.id !== deletedId);
      });
    },
  });
}
```

## Unique Patterns

1. **Query Keys**: Centralized constants exported at top
2. **Query Hooks**: Named `use{Resource}s` for lists, `use{Resource}` for single
3. **Mutation Hooks**: Named `useCreate{Resource}`, `useUpdate{Resource}`, `useDelete{Resource}`
4. **Query Client**: Get via `useQueryClient()` hook
5. **Optimistic Updates**: Use `setQueryData` in `onSuccess`
6. **Type Cache**: Type `queryClient.setQueryData<Type[]>`
7. **Enabled**: Use `enabled: !!id` for conditional queries
8. **JSDoc**: Document each hook

## Query Key Patterns

```typescript
// List query key
export const TODOS_QUERY_KEY = ["todos"];

// Single item query key (includes ID)
[...TODOS_QUERY_KEY, id]; // ["todos", "123"]
```

## Cache Update Patterns

```typescript
// Add to cache (create)
queryClient.setQueryData<Item[]>(QUERY_KEY, (old) => {
  if (!old) return [newItem];
  return [...old, newItem];
});

// Update in cache
queryClient.setQueryData<Item[]>(QUERY_KEY, (old) => {
  if (!old) return old;
  return old.map((item) => (item.id === updatedItem.id ? updatedItem : item));
});

// Remove from cache (delete)
queryClient.setQueryData<Item[]>(QUERY_KEY, (old) => {
  if (!old) return old;
  return old.filter((item) => item.id !== deletedId);
});
```

## Conventions

- Query keys as exported constants
- Hooks named `use{Resource}`
- Use `setQueryData` not `invalidateQueries`
- Type all cache operations
- Include JSDoc for all hooks
- Single file for all query hooks
- Import API functions from `./api`
