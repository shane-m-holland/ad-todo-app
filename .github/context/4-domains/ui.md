# UI Domain

## Overview

UI components use React with TypeScript, Next.js App Router, and Tailwind CSS for styling. Components follow a functional, composable pattern with proper TypeScript typing and accessibility considerations.

## Component Structure

### Component File Pattern

```typescript
"use client";  // Only for components with interactivity

import { useUpdateTodo, useDeleteTodo } from "@/services/queries";
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
  // Component logic here
  return (
    <motion.div>
      {/* JSX here */}
    </motion.div>
  );
}
```

**Patterns:**

- `"use client"` directive for interactive components (Next.js App Router)
- Named export (not default) for components
- Props interface with JSDoc comments
- Component-level JSDoc describing purpose
- TypeScript for all props and state

## Component Categories

### Page Components (app/ directory)

```typescript
// app/page.tsx
import { TodoForm } from "@/components/TodoForm";
import { TodoList } from "@/components/TodoList";

/**
 * Home page component displaying the todo application.
 * Combines the TodoForm for creating new todos and TodoList for displaying existing todos.
 */
export default function Home() {
  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Todo App</h1>
          <p className="text-gray-600">
            A simple and elegant way to manage your tasks
          </p>
        </header>

        <TodoForm />
        <TodoList />
      </div>
    </main>
  );
}
```

**Patterns:**

- Default export for page components (Next.js convention)
- Compose smaller components
- Structure with semantic HTML (main, header)
- Use Tailwind for all styling

### Layout Components (app/ directory)

```typescript
// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Todo App",
  description: "A simple and elegant todo application",
};

/**
 * Root layout component for the Next.js application.
 * Wraps all pages with common providers and layout elements.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**Patterns:**

- Configure fonts at layout level
- Export metadata for SEO
- Wrap with providers
- Server component by default (no "use client")

### Reusable Components (components/ directory)

```typescript
// components/TodoItem.tsx
"use client";

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const handleToggleComplete = () => {
    updateTodo.mutate({
      id: todo.id,
      data: { completed: !todo.completed },
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="bg-white rounded-lg shadow-sm p-4 mb-3"
      data-testid="todo-item"
    >
      {/* Component content */}
    </motion.div>
  );
}
```

**Patterns:**

- "use client" for components with hooks/interactivity
- Named exports
- Event handlers start with `handle`
- Use data-testid for testing
- Use motion components for animations

## Styling with Tailwind

### Utility Class Patterns

```typescript
// Container
<div className="max-w-4xl mx-auto px-4 py-8">

// Card
<div className="bg-white rounded-lg shadow-sm p-4">

// Button - Primary
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">

// Button - Danger
<button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">

// Input
<input className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" />

// Text
<h1 className="text-4xl font-bold text-gray-900 mb-2">
<p className="text-gray-600">

// Conditional Classes
<div className={`px-4 py-3 ${error ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"}`}>
```

### Responsive Design

```typescript
// Mobile first, then larger screens
<div className="px-4 md:px-8 lg:px-12">
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
```

## Animations with Framer Motion

### Layout Animations

```typescript
import { motion } from "framer-motion";

<motion.div
  layout                          // Automatic layout animations
  initial={{ opacity: 0, y: -10 }}  // Initial state
  animate={{ opacity: 1, y: 0 }}    // Animated state
  exit={{ opacity: 0, x: -100 }}    // Exit animation
  transition={{ duration: 0.2 }}    // Animation timing
>
```

### Button with Hover/Tap

```typescript
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
>
```

## Accessibility

### Semantic HTML

```typescript
<main>
  <header>
    <h1>Page Title</h1>
  </header>

  <form onSubmit={handleSubmit}>
    <label htmlFor="title">Title</label>
    <input id="title" type="text" />
    <button type="submit">Submit</button>
  </form>
</main>
```

### ARIA Attributes

```typescript
<button
  onClick={handleDelete}
  aria-label="Delete todo item"
  className="text-red-600"
>
  <TrashIcon />
</button>
```

### Keyboard Navigation

```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === "Enter") {
    handleSave();
  } else if (e.key === "Escape") {
    handleCancel();
  }
};

<input onKeyDown={handleKeyDown} />
```

## Testing Attributes

```typescript
<form data-testid="todo-form">
  <input data-testid="todo-input" />
  <button data-testid="submit-button">
</form>
```

## State Management in Components

### Local UI State (useState)

```typescript
const [isEditing, setIsEditing] = useState(false);
const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
```

**Use for:**

- UI-only state (modals open/closed, editing mode)
- Temporary messages
- Form input (when not using react-hook-form)

### Server State (React Query)

```typescript
const { data: todos, isLoading } = useTodos();
const createTodo = useCreateTodo();
```

**Use for:**

- Data from API
- All CRUD operations
- Loading/error states

## Event Handlers

```typescript
/**
 * Handles form submission to create a new todo.
 */
const onSubmit = async (data: TodoFormData) => {
  // Handler logic
};

/**
 * Toggles the completion status of the todo.
 */
const handleToggleComplete = () => {
  updateTodo.mutate({
    id: todo.id,
    data: { completed: !todo.completed },
  });
};
```

**Patterns:**

- Name handlers `handle{Action}` or `on{Event}`
- Include JSDoc for complex handlers
- Use async when needed
- Keep handlers focused and small

## Conventions

1. **Named Exports**: Use named exports, not default (except pages)
2. **"use client"**: Add directive for interactive components
3. **TypeScript**: Full typing on all props and state
4. **Props Interface**: Define interface with JSDoc
5. **Component JSDoc**: Document component purpose
6. **Tailwind Only**: No inline styles or CSS modules
7. **Data Test IDs**: Include for testing
8. **Accessibility**: Semantic HTML and ARIA labels
9. **Framer Motion**: For animations
10. **File Names**: PascalCase matching component name

## Anti-Patterns to Avoid

❌ **Don't use inline styles**

```typescript
// BAD
<div style={{ padding: "1rem", backgroundColor: "white" }}>

// GOOD
<div className="p-4 bg-white">
```

❌ **Don't use default exports for components**

```typescript
// BAD
export default function TodoItem() {}

// GOOD (except for pages)
export function TodoItem() {}
```

❌ **Don't forget "use client" for interactive components**

```typescript
// BAD - Will cause error if using useState/hooks
export function TodoItem() {
  const [state, setState] = useState(); // Error!

// GOOD
"use client";
export function TodoItem() {
  const [state, setState] = useState(); // Works!
```

❌ **Don't use useState for server data**

```typescript
// BAD
const [todos, setTodos] = useState<Todo[]>([]);

// GOOD
const { data: todos } = useTodos();
```

## File Organization

```
app/
  layout.tsx         # Root layout
  page.tsx          # Home page
  globals.css       # Global styles
  providers.tsx     # React Query provider

components/
  TodoForm.tsx      # Form component
  TodoItem.tsx      # Item component
  TodoList.tsx      # List component
```

## Summary

UI components in this project:

- Use React with TypeScript for type safety
- Follow Next.js App Router conventions
- Style exclusively with Tailwind CSS
- Animate with Framer Motion
- Maintain accessibility standards
- Keep components focused and composable
- Separate concerns (UI vs data fetching)
