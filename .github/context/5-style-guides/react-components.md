# React Components Style Guide

## Overview

React components use TypeScript, functional components with hooks, and Tailwind CSS for styling. Interactive components use "use client" directive.

## File Location

- Path: `frontend/components/`
- Example: `frontend/components/TodoItem.tsx`

## File Structure Template

```typescript
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useUpdateItem, useDeleteItem } from "@/services/queries";
import { Item } from "@/types/item";

interface {Component}Props {
  /** Description of prop */
  item: Item;
}

/**
 * Component for displaying and interacting with {description}.
 *
 * @param props - Component props
 */
export function {Component}({ item }: {Component}Props) {
  const [localState, setLocalState] = useState(false);
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();

  const handleAction = () => {
    // Handler logic
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm p-4"
      data-testid="component-name"
    >
      {/* Component content */}
    </motion.div>
  );
}
```

## Unique Patterns

1. **"use client"**: Add directive for components with interactivity
2. **Named Exports**: Use named export, not default
3. **Props Interface**: Define interface with JSDoc comments
4. **Component JSDoc**: Document component purpose
5. **TypeScript**: Full typing on all props and state
6. **Tailwind Only**: No inline styles or CSS modules
7. **Data Test IDs**: Include `data-testid` for testing
8. **Event Handlers**: Name handlers `handle{Action}`
9. **Motion**: Use framer-motion for animations
10. **React Query**: Use custom hooks for server state

## State Patterns

```typescript
// Local UI state (useState)
const [isEditing, setIsEditing] = useState(false);
const [message, setMessage] = useState<string | null>(null);

// Server state (React Query)
const { data: items, isLoading } = useItems();
const updateItem = useUpdateItem();
```

## Event Handlers

```typescript
/**
 * Handles button click to perform action.
 */
const handleClick = () => {
  updateItem.mutate({
    id: item.id,
    data: { field: newValue },
  });
};

const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === "Enter") {
    handleSave();
  }
};
```

## Styling Patterns

```typescript
// Static classes
<div className="bg-white rounded-lg shadow-sm p-4">

// Conditional classes
<div className={`px-4 py-3 ${error ? "border-red-300" : "border-gray-200"}`}>

// With state
className={completed ? "line-through text-gray-400" : "text-gray-900"}
```

## Animation Patterns

```typescript
<motion.div
  layout
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, x: -100 }}
  whileHover={{ scale: 1.02 }}
>
```

## Conventions

- Use "use client" for interactive components
- Named exports only
- Props interfaces with JSDoc
- TypeScript for everything
- Tailwind for all styling
- data-testid for testing
- Framer Motion for animations
- Event handlers named `handle{Action}`
