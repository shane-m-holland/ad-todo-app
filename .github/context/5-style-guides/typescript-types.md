# TypeScript Types Style Guide

## Overview

TypeScript interfaces define the shape of data structures. Types match backend Pydantic schemas and are used throughout the frontend.

## File Location

- Path: `frontend/types/`
- Example: `frontend/types/todo.ts`

## File Structure Template

```typescript
/**
 * {Resource} item interface matching the backend schema.
 */
export interface {Resource} {
  /** Unique identifier */
  id: string;
  /** Field description */
  field: string;
  /** Another field */
  anotherField: boolean;
  /** ISO timestamp of when created */
  created_at: string;
  /** ISO timestamp of when last updated */
  updated_at: string;
}

/**
 * Data required to create a new {resource}.
 */
export interface {Resource}Create {
  /** Field description */
  field: string;
  /** Optional field */
  anotherField?: boolean;
}

/**
 * Data allowed for updating an existing {resource}.
 */
export interface {Resource}Update {
  /** Optional field to update */
  field?: string;
  /** Optional field to update */
  anotherField?: boolean;
}
```

## Unique Patterns

1. **Three-Interface Pattern**: Main type, Create type, Update type
2. **Match Backend**: Types match Pydantic schemas exactly
3. **JSDoc Comments**: Every interface and field documented
4. **Export All**: All types exported
5. **Timestamps as Strings**: `created_at`/`updated_at` are ISO strings
6. **Optional Updates**: All fields optional in Update type
7. **Required Creates**: Required fields in Create type not optional
8. **PascalCase**: Interface names in PascalCase

## Field Type Patterns

```typescript
// Required string
title: string;

// Optional string
title?: string;

// Boolean
completed: boolean;

// Optional boolean
completed?: boolean;

// Number
count: number;

// Array
tags: string[];

// Nested object
metadata: {
  key: string;
  value: string;
};

// Union types
status: "pending" | "completed" | "failed";

// ISO date string (not Date object)
created_at: string;
```

## Naming Conventions

```typescript
// Main interface
export interface Todo {}

// Create interface
export interface TodoCreate {}

// Update interface
export interface TodoUpdate {}

// List response (if needed)
export interface TodoList {
  todos: Todo[];
  total: number;
}
```

## Conventions

- Match backend schemas exactly
- Use JSDoc for all interfaces and fields
- Three-interface pattern (Main, Create, Update)
- Timestamps as strings (ISO format)
- PascalCase interface names
- Optional fields use `?` not `| undefined`
- Export all types
- One file per resource type
