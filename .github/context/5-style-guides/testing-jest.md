# Jest Component Testing Style Guide

## Overview

Frontend component tests use Jest with React Testing Library, mocking React Query hooks and focusing on user interactions.

## File Location

- Path: `frontend/__tests__/`
- Example: `frontend/__tests__/components/TodoItem.test.tsx`

## File Structure Template

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { {Component} } from '@/components/{Component}';
import * as queries from '@/services/queries';

// Mock React Query hooks
jest.mock('@/services/queries');

describe('{Component}', () => {
  let queryClient: QueryClient;
  const mockMutation = jest.fn();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    (queries.useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutation,
      isPending: false,
    });
  });

  it('renders component with expected elements', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <{Component} prop="value" />
      </QueryClientProvider>
    );

    expect(screen.getByTestId('component-id')).toBeInTheDocument();
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction correctly', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <{Component} prop="value" />
      </QueryClientProvider>
    );

    const button = screen.getByRole('button', { name: /action/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockMutation).toHaveBeenCalledWith(
        expect.objectContaining({ field: 'value' }),
        expect.any(Object)
      );
    });
  });

  it('displays error state when mutation fails', async () => {
    (queries.useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutation,
      isPending: false,
      error: new Error('Something went wrong'),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <{Component} prop="value" />
      </QueryClientProvider>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});
```

## Unique Patterns

1. **Mock React Query**: Use `jest.mock('@/services/queries')`
2. **Query Client**: Create fresh QueryClient for each test
3. **Wrap in Provider**: All components wrapped in QueryClientProvider
4. **Testing Library**: Use `render`, `screen`, `fireEvent`, `waitFor`
5. **User-Centric**: Test user interactions, not implementation
6. **Descriptive Tests**: Test names describe user behavior
7. **Async Helpers**: Use `waitFor` for async updates
8. **Multiple Cases**: Test success, error, and edge cases

## Query Patterns

```typescript
// By test ID
screen.getByTestId("todo-input");

// By role
screen.getByRole("button", { name: /add/i });
screen.getByRole("checkbox");

// By text
screen.getByText("Expected Text");
screen.getByText(/pattern/i);

// Query (doesn't throw)
screen.queryByText("Might not exist");
```

## Interaction Patterns

```typescript
// Click
fireEvent.click(screen.getByRole("button"));

// Type
fireEvent.change(screen.getByTestId("input"), {
  target: { value: "New value" },
});

// Key press
fireEvent.keyDown(screen.getByTestId("input"), { key: "Enter" });
```

## Async Patterns

```typescript
// Wait for element to appear
await waitFor(() => {
  expect(screen.getByText("Success")).toBeInTheDocument();
});

// Wait for condition
await waitFor(() => {
  expect(mockFn).toHaveBeenCalled();
});
```

## Mock Patterns

```typescript
// Mock hook with return value
(queries.useItems as jest.Mock).mockReturnValue({
  data: [{ id: "1", title: "Test" }],
  isLoading: false,
  error: null,
});

// Mock mutation
(queries.useCreateItem as jest.Mock).mockReturnValue({
  mutate: mockMutateFn,
  isPending: false,
});

// Mock mutation that calls onSuccess
mockMutate.mockImplementation((data, { onSuccess }) => {
  onSuccess({ id: "1", ...data });
});
```

## Conventions

- Mock React Query hooks with jest.mock
- Fresh QueryClient per test
- Wrap components in QueryClientProvider
- Use Testing Library queries
- Test user behavior, not implementation
- Use waitFor for async updates
- Descriptive test names
- Test multiple scenarios (success, error, edge cases)
