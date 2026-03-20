# Forms Domain

## Overview

Form handling uses react-hook-form v7, which provides performant, flexible form management with built-in validation. Forms are integrated with React Query mutations for server submission.

## Basic Form Pattern

```typescript
"use client";

import { useForm } from "react-hook-form";
import { useCreateTodo } from "@/services/queries";
import { TodoCreate } from "@/types/todo";
import { useState } from "react";

interface TodoFormData {
  title: string;
}

export function TodoForm() {
  const {
    register,        // Register input fields
    handleSubmit,    // Wrap submit handler
    reset,          // Reset form after submit
    formState: { errors },  // Access validation errors
  } = useForm<TodoFormData>();

  const createTodo = useCreateTodo();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

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
        setTimeout(() => setFeedback(null), 3000);
      },
      onError: (error) => {
        setFeedback({
          type: "error",
          message: error.message,
        });
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} data-testid="todo-form">
      {/* Form fields */}
    </form>
  );
}
```

## Form Elements

### Text Input with Validation

```typescript
<input
  type="text"
  placeholder="What needs to be done?"
  data-testid="todo-input"
  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
    ${errors.title ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"}`}
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
```

**Patterns:**

- Use `{...register("fieldName", validationRules)}`
- Validation rules inline with register
- Conditional styling based on `errors.fieldName`
- Disable during submission with `mutation.isPending`

### Error Display

```typescript
{errors.title && (
  <p className="mt-1 text-sm text-red-600">
    {errors.title.message}
  </p>
)}
```

### Submit Button

```typescript
<button
  type="submit"
  disabled={createTodo.isPending}
  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700
    disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
>
  {createTodo.isPending ? "Adding..." : "Add Todo"}
</button>
```

**Patterns:**

- Show loading state in button text
- Disable during submission
- Use conditional text based on `isPending`

## Validation Rules

### Required Field

```typescript
{...register("title", {
  required: "This field is required"
})}
```

### String Length

```typescript
{...register("title", {
  minLength: { value: 1, message: "Too short" },
  maxLength: { value: 500, message: "Too long" }
})}
```

### Custom Validation

```typescript
{...register("title", {
  validate: {
    notEmpty: (value) => value.trim().length > 0 || "Cannot be empty",
    noSpecialChars: (value) => !/[<>]/.test(value) || "No special characters allowed"
  }
})}
```

### Pattern Matching

```typescript
{...register("email", {
  pattern: {
    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: "Invalid email address"
  }
})}
```

## Form Integration with React Query

### Mutation Callbacks

```typescript
const onSubmit = async (data: FormData) => {
  mutation.mutate(data, {
    onSuccess: () => {
      reset(); // Clear form
      showSuccessMessage();
    },
    onError: (error) => {
      showErrorMessage(error.message);
    },
  });
};
```

### Loading State

```typescript
const isSubmitting = createTodo.isPending;

// Disable form during submission
<input disabled={isSubmitting} />
<button disabled={isSubmitting}>
  {isSubmitting ? "Submitting..." : "Submit"}
</button>
```

## Feedback Messages

```typescript
const [feedback, setFeedback] = useState<{
  type: "success" | "error";
  message: string;
} | null>(null);

// Show message
setFeedback({
  type: "success",
  message: "Todo created successfully!",
});

// Auto-clear after 3 seconds
setTimeout(() => setFeedback(null), 3000);

// Display
{feedback && (
  <div className={`p-3 rounded-lg ${
    feedback.type === "success"
      ? "bg-green-50 text-green-800 border border-green-200"
      : "bg-red-50 text-red-800 border border-red-200"
  }`}>
    {feedback.message}
  </div>
)}
```

## Form Reset

```typescript
// After successful submission
onSuccess: () => {
  reset(); // Clears all form fields
};

// Preserve some values
reset({ title: "", keepCompleted: formData.keepCompleted });

// Reset to specific values
reset(defaultValues);
```

## Conventions

1. **useForm**: Always destructure needed functions at top of component
2. **Type Form Data**: Define interface for form data
3. **Register Pattern**: Use `{...register()}` spread
4. **Inline Validation**: Define rules in register call
5. **Error Display**: Show errors below fields
6. **Disabled State**: Disable during submission
7. **Loading Text**: Update button text during submission
8. **Reset on Success**: Clear form after successful submission
9. **Mutation Integration**: Use React Query mutations for submission
10. **Feedback Messages**: Show success/error feedback to user

## Anti-Patterns to Avoid

❌ **Don't use controlled components with useState**

```typescript
// BAD - Manual state management
const [title, setTitle] = useState("");
<input value={title} onChange={e => setTitle(e.target.value)} />

// GOOD - react-hook-form
<input {...register("title")} />
```

❌ **Don't validate in submit handler**

```typescript
// BAD
const onSubmit = (data) => {
  if (!data.title) {
    setError("Title required");
    return;
  }
  // ...
}

// GOOD - Validate in register
{...register("title", { required: "Title required" })}
```

❌ **Don't forget to disable during submission**

```typescript
// BAD
<button type="submit">Submit</button>

// GOOD
<button type="submit" disabled={mutation.isPending}>
  {mutation.isPending ? "Submitting..." : "Submit"}
</button>
```

❌ **Don't forget to reset form**

```typescript
// BAD
onSuccess: () => {
  setFeedback({ type: "success", message: "Done!" });
  // Form still has old values
};

// GOOD
onSuccess: () => {
  reset(); // Clear form
  setFeedback({ type: "success", message: "Done!" });
};
```

## File Organization

```
components/
  TodoForm.tsx      # Form components
```

## Summary

Forms in this project:

- Use react-hook-form for efficient form management
- Integrate with React Query mutations
- Provide inline validation
- Show loading states during submission
- Display success/error feedback
- Reset after successful submission
- Maintain accessibility
