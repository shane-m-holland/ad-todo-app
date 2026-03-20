# GitHub Copilot Instructions for Todo App

## Overview

This file enables AI coding assistants to generate features aligned with the project's architecture and style. It's based on actual, observed patterns from the codebase—not invented practices.

This is a **full-stack TODO management application** with:

- **Backend**: Python 3.12+ with FastAPI, SQLAlchemy (async), PostgreSQL
- **Frontend**: TypeScript with Next.js 16 (App Router), React 18, React Query, Tailwind CSS
- **Testing**: pytest (backend), Jest + React Testing Library (frontend), Playwright (E2E)
- **Infrastructure**: Docker Compose for local development

### Project Philosophy

- **Async-first**: Both backend (AsyncSession, asyncpg) and frontend (React Query) use async patterns
- **Type safety**: Strong TypeScript/Python typing throughout
- **Separation of concerns**: Clear CRUD layer separation from API endpoints
- **Test-driven**: Comprehensive testing at unit, integration, and E2E levels
- **Modern patterns**: Python 3.12+, SQLAlchemy 2.0, React Query v5, Next.js App Router

---

## ⚠️ TEST-DRIVEN DEVELOPMENT (TDD) - MANDATORY

**All code generation MUST follow the Red-Green-Refactor cycle:**

### 1. RED: Write Tests First

Before implementing any feature:

1. **Create test files** with comprehensive test cases
2. **Define interfaces/types** that tests will use
3. **Create stubs/skeletons** of functions/components that tests call
4. **Run tests** - they should FAIL (red)

### 2. GREEN: Implement to Pass Tests

1. **Implement the actual functionality** to make tests pass
2. **Run tests** - they should PASS (green)
3. **Do NOT refactor yet** - just make it work

### 3. REFACTOR: Improve While Maintaining Green

1. **Refactor implementation** for better code quality
2. **Run tests after each refactor** - they must stay GREEN
3. **Iterate** refactoring until code meets project standards

### TDD Example Flow

**User Request**: "Add a priority field to todos"

**Step 1 (RED)** - Create interfaces and tests:

```typescript
// types/todo.ts - Update interface
export interface Todo {
  // ... existing fields
  priority: "low" | "medium" | "high";
}

// __tests__/components/TodoItem.test.tsx - Add test
it('displays priority badge', () => {
  const todo = { ...mockTodo, priority: 'high' };
  render(<TodoItem todo={todo} />);
  expect(screen.getByText(/high priority/i)).toBeInTheDocument();
});
```

**Step 2 (GREEN)** - Implement to pass:

```typescript
// components/TodoItem.tsx - Add basic implementation
export function TodoItem({ todo }: TodoItemProps) {
  return (
    <div>
      {/* existing code */}
      <span>{todo.priority} priority</span>
    </div>
  );
}
```

**Step 3 (REFACTOR)** - Improve while keeping tests green:

```typescript
// components/TodoItem.tsx - Refactor with better styling
const priorityBadge = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
};

export function TodoItem({ todo }: TodoItemProps) {
  return (
    <div>
      {/* existing code */}
      <span className={` px-2 py-1 rounded text-xs font-medium ${priorityBadge[todo.priority]}`}>
        {todo.priority}
      </span>
    </div>
  );
}
```

---

## File Categories

### Backend Files

#### API Endpoints (`backend/app/api/v1/endpoints/`)

RESTful API endpoint handlers using FastAPI routers with dependency injection.

- **Example**: `backend/app/api/v1/endpoints/todos.py`
- **Conventions**: Async handlers, Pydantic schemas, dependency injection, HTTPException for errors
- **See**: `.github/context/5-style-guides/api-endpoints.md`

#### Database Models (`backend/app/models/`)

SQLAlchemy ORM models with `Mapped` type hints and async support.

- **Example**: `backend/app/models/todo.py`
- **Conventions**: UUID primary keys, timestamps, `Mapped[]` annotations, `mapped_column`
- **See**: `.github/context/5-style-guides/database-models.md`

#### Pydantic Schemas (`backend/app/schemas/`)

Request/response validation schemas following Base/Create/Update/Response pattern.

- **Example**: `backend/app/schemas/todo.py`
- **Conventions**: Four-schema pattern, `Field()` validation, `from_attributes=True` for responses
- **See**: `.github/context/5-style-guides/pydantic-schemas.md`

#### CRUD Operations (`backend/app/crud.py`)

Data access layer that abstracts database operations from endpoints.

- **Conventions**: AsyncSession first parameter, return None for not found, flush not commit
- **See**: `.github/context/5-style-guides/crud-operations.md`

#### Database Migrations (`backend/alembic/versions/`)

Alembic migration files for schema changes.

- **Generate**: `alembic revision --autogenerate -m "message"`
- **Apply**: `alembic upgrade head`

#### Tests - Backend (`backend/tests/`)

pytest-based tests with async support and in-memory SQLite.

- **Examples**: `test_crud.py`, `test_api.py`, `test_models.py`
- **Conventions**: `@pytest.mark.asyncio`, fixtures (`db_session`, `client`), descriptive names
- **See**: `.github/context/5-style-guides/testing-pytest.md`

### Frontend Files

#### React Components (`frontend/components/`)

Functional React components with TypeScript and Tailwind CSS.

- **Examples**: `TodoForm.tsx`, `TodoItem.tsx`, `TodoList.tsx`
- **Conventions**: "use client" for interactivity, named exports, data-testid, Tailwind styling
- **See**: `.github/context/5-style-guides/react-components.md`

#### React Query Hooks (`frontend/services/queries.ts`)

Custom hooks encapsulating data fetching with React Query.

- **Conventions**: Query keys as constants, optimistic cache updates, `useQueryClient`
- **See**: `.github/context/5-style-guides/react-query-hooks.md`

#### TypeScript Types (`frontend/types/`)

Interface definitions matching backend Pydantic schemas.

- **Example**: `frontend/types/todo.ts`
- **Conventions**: Three-interface pattern (Main/Create/Update), JSDoc comments
- **See**: `.github/context/5-style-guides/typescript-types.md`

#### API Client (`frontend/services/api.ts`)

Pure HTTP functions for API calls (used by React Query hooks).

- **Conventions**: Return Promises, throw on errors, use environment variables for URLs

#### Tests - Frontend Unit (`frontend/__tests__/`)

Jest + React Testing Library for component tests.

- **Examples**: `components/TodoItem.test.tsx`, `services/queries.test.tsx`
- **Conventions**: Mock React Query hooks, QueryClientProvider wrapper, Testing Library queries
- **See**: `.github/context/5-style-guides/testing-jest.md`

#### Tests - E2E (`frontend/e2e/`)

Playwright tests for full user workflows.

- **Examples**: `happy-paths.spec.ts`, `error-scenarios.spec.ts`
- **Conventions**: Clear database before tests, test real browser behavior

---

## Feature Scaffold Guide

When implementing a new feature, determine which categories of files to create based on the feature scope:

### Adding a Simple Field

**Example**: Add a "priority" field to todos

**Backend**:

1. Update database model (`app/models/todo.py`)
2. Create Alembic migration
3. Update Pydantic schemas (`app/schemas/todo.py`)
4. Update CRUD functions if needed (`app/crud.py`)
5. Add tests (`tests/test_models.py`, `tests/test_api.py`)

**Frontend**:

1. Update TypeScript types (`types/todo.ts`)
2. Update React components to display/edit field
3. Add tests (`__tests__/components/...`)

### Adding a New Resource

**Example**: Add "categories" resource

**Backend**:

1. Database model (`app/models/category.py`)
2. Alembic migration
3. Pydantic schemas (`app/schemas/category.py`)
4. CRUD operations (`app/crud.py` or `app/crud/category.py`)
5. API endpoints (`app/api/v1/endpoints/categories.py`)
6. Register router in `app/api/v1/__init__.py`
7. Tests (`tests/test_crud.py`, `tests/test_api.py`, `tests/test_models.py`)

**Frontend**:

1. TypeScript types (`types/category.ts`)
2. API client functions (`services/api.ts`)
3. React Query hooks (`services/queries.ts`)
4. React components (`components/CategoryForm.tsx`, `components/CategoryList.tsx`)
5. Tests (`__tests__/components/...`, `__tests__/services/...`)
6. E2E tests (`e2e/categories.spec.ts`)

### File Naming Conventions

**Backend**:

- Models: `{resource}.py` (singular, e.g., `todo.py`)
- Schemas: `{resource}.py` (singular, e.g., `todo.py`)
- Endpoints: `{resources}.py` (plural, e.g., `todos.py`)
- Tests: `test_{module}.py` (e.g., `test_crud.py`)

**Frontend**:

- Components: `{ComponentName}.tsx` (PascalCase, e.g., `TodoItem.tsx`)
- Types: `{resource}.ts` (singular, e.g., `todo.ts`)
- Tests: `{ComponentName}.test.tsx` or `{module}.test.ts`

**File Placement**:

- Components in `components/` are reusable across pages
- Pages in `app/` follow Next.js App Router structure
- Providers in `app/providers.tsx`
- Global styles in `app/globals.css`

---

## Integration Rules

These constraints ensure new code follows established architectural patterns:

### Backend Constraints

1. **API Endpoints**:
   - ✅ Must use `APIRouter` with prefix and tags
   - ✅ All handlers must be async
   - ✅ Database sessions via `Depends(get_db)` only
   - ✅ All inputs/outputs use Pydantic schemas
   - ✅ Delegate business logic to CRUD layer
   - ❌ No database operations in endpoints
   - ❌ No manual session creation

2. **Database Operations**:
   - ✅ All operations must be async
   - ✅ Use `Mapped[]` type hints with `mapped_column`
   - ✅ UUID primary keys (not integers)
   - ✅ Include `created_at` and `updated_at` timestamps
   - ✅ Use `flush()` not `commit()` in CRUD functions
   - ✅ All schema changes via Alembic migrations
   - ❌ No synchronous SQLAlchemy
   - ❌ No raw SQL queries

3. **Validation**:
   - ✅ Use four-schema pattern: Base, Create, Update, Response
   - ✅ `from_attributes=True` in Response schemas
   - ✅ All Update schema fields optional
   - ✅ Use `Field()` with validation rules
   - ❌ Don't validate in endpoints (use schemas)

### Frontend Constraints

1. **State Management**:
   - ✅ Use React Query for all server state
   - ✅ Optimistic cache updates with `setQueryData`
   - ✅ Query keys as exported constants
   - ❌ No `useState` for server data
   - ❌ No direct fetch calls in components

2. **Components**:
   - ✅ Use "use client" directive for interactive components
   - ✅ Named exports only (except pages)
   - ✅ TypeScript with full type annotations
   - ✅ Tailwind CSS for all styling
   - ✅ Include `data-testid` for testing
   - ❌ No inline styles
   - ❌ No CSS modules
   - ❌ No default exports (except pages)

3. **Forms**:
   - ✅ Use react-hook-form's `useForm` hook
   - ✅ Validation rules in `register()` call
   - ✅ Reset form after successful submission
   - ❌ No manual state management with useState
   - ❌ No validation in submit handlers

4. **Styling**:
   - ✅ Tailwind utility classes only
   - ✅ Mobile-first responsive design
   - ✅ Framer Motion for animations
   - ❌ No custom CSS files per component
   - ❌ No inline `style` prop

---

## Example Prompt Usage

### Example 1: Add a Field

**Prompt**: "Add a 'priority' field to todos with values low, medium, high. Include UI to set and display priority."

**Expected AI Response** (TDD approach):

**Step 1 - Tests and Interfaces (RED)**:

1. `backend/tests/test_models.py`:

```python
@pytest.mark.asyncio
async def test_todo_with_priority(db_session: AsyncSession):
    """Test creating a todo with priority field."""
    from app import crud
    from app.schemas.todo import TodoCreate

    todo_data = TodoCreate(title="Test", completed=False, priority="high")
    todo = await crud.create_todo(db_session, todo_data)

    assert todo.priority == "high"
```

2. `backend/app/schemas/todo.py` - Add to schemas
3. `backend/app/models/todo.py` - Add priority field stub
4. Create Alembic migration
5. `frontend/types/todo.ts` - Add to TypeScript interface
6. `frontend/__tests__/components/TodoItem.test.tsx` - Add priority display test

**Step 2 - Implementation (GREEN)**:

1. Implement database model with priority column
2. Apply migration
3. Update CRUD operations
4. Update API endpoints
5. Update React components to display and edit priority
6. Update API client

**Step 3 - Refactor**:

1. Add color-coded priority badges
2. Add priority filtering
3. Optimize queries
4. Run all tests - ensure GREEN

### Example 2: Add New Resource

**Prompt**: "Add a 'tags' feature where each todo can have multiple tags. Users should be able to create, edit, and filter by tags."

**Expected Files** (TDD):

**Backend (Tests First)**:

- `tests/test_models.py` - Tag model tests
- `tests/test_crud.py` - Tag CRUD tests
- `tests/test_api.py` - Tag endpoint tests
- `app/models/tag.py` - Tag model (stub)
- `backend/alembic/versions/XXX_create_tags_table.py` - Migration
- `app/schemas/tag.py` - Pydantic schemas (stubs)
- `app/crud.py` or `app/crud/tag.py` - CRUD operations
- `app/api/v1/endpoints/tags.py` - API endpoints
- Update `app/api/v1/__init__.py` - Register router

**Frontend (Tests First)**:

- `frontend/__tests__/components/TagInput.test.tsx` - Tag input tests
- `frontend/__tests__/services/queries.test.tsx` - Tag query tests
- `types/tag.ts` - TypeScript types (stubs)
- `services/api.ts` - API functions (stubs)
- `services/queries.ts` - React Query hooks
- `components/TagInput.tsx` - Tag input component
- `components/TagList.tsx` - Tag list component
- Update `components/TodoForm.tsx` - Add tag selection
- `e2e/tags.spec.ts` - E2E tests

### Example 3: Add Validation

**Prompt**: "Add validation to prevent duplicate todo titles"

**Expected Implementation** (TDD):

**Backend Tests First**:

```python
# tests/test_api.py
@pytest.mark.asyncio
async def test_reject_duplicate_todo_titles(client: AsyncClient):
    """Test that duplicate titles are rejected."""
    await client.post("/api/v1/todos", json={"title": "Buy milk"})

    response = await client.post("/api/v1/todos", json={"title": "Buy milk"})

    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]
```

**Then Implement**:

- Add unique constraint to database model
- Create migration
- Add validation in CRUD layer
- Update tests to verify

---

## TDD Workflow Summary

For **every** feature request:

1. **Write comprehensive tests first** - They will fail (RED)
2. **Create type definitions and stubs** - Define interfaces
3. **Run tests** - Verify they fail for the right reasons
4. **Implement minimal code to pass** - Make tests GREEN
5. **Refactor for quality** - Keep tests GREEN
6. **Run full test suite** - Ensure nothing broke

**Test Coverage Expectations**:

- Backend: `pytest --cov=app` should show >80% coverage
- Frontend: `npm run test:coverage` should show >80% coverage
- E2E: Critical user workflows must be covered

---

## Additional Resources

Detailed documentation for each domain is available in `.github/context/`:

- **Tech Stack**: `.github/context/1-determine-techstack.md`
- **File Categorization**: `.github/context/2-file-categorization.json`
- **Architecture**: `.github/context/3-architectural-domains.json`
- **Domain Deep Dives**: `.github/context/4-domains/*.md`
- **Style Guides**: `.github/context/5-style-guides/*.md`

---

## Requirements Summary

- ✅ Always follow TDD: Red → Green → Refactor
- ✅ Tests and interfaces before implementation
- ✅ No invented best practices - only observed patterns
- ✅ Full type safety (TypeScript/Python)
- ✅ Async-first architecture
- ✅ Comprehensive testing at all levels
- ✅ Tailwind CSS for all styling
- ✅ React Query for server state
- ✅ Proper separation of concerns

This document gives AI assistants enough information to build new features entirely within project conventions while maintaining the test-driven development approach.
