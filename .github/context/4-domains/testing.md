# Testing Domain

## Overview

This project has comprehensive testing with three layers:

1. **Backend Unit/Integration Tests** - pytest with async support
2. **Frontend Unit Tests** - Jest with React Testing Library
3. **End-to-End Tests** - Playwright for full user workflows

## Backend Testing (pytest)

### Test Configuration

`backend/pyproject.toml`:

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
asyncio_mode = "auto"
pythonpath = ["."]
```

### Test Fixtures (`tests/conftest.py`)

```python
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.base import Base, get_db
from app.models import Todo

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture(scope="function")
async def test_db_engine():
    """Create test database engine using SQLite in-memory."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(test_db_engine) -> AsyncSession:
    """Provide database session for tests."""
    async_session = async_sessionmaker(
        test_db_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async with async_session() as session:
        yield session


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncClient:
    """Provide HTTP client for API testing."""
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac

    app.dependency_overrides.clear()
```

**Patterns:**

- Use `pytest_asyncio` for async fixtures
- In-memory SQLite for fast, isolated tests
- Override `get_db` dependency for testing
- Clean up after each test

### CRUD Tests

```python
@pytest.mark.asyncio
async def test_create_todo(db_session: AsyncSession):
    """Test creating a new todo."""
    from app import crud
    from app.schemas.todo import TodoCreate

    todo_data = TodoCreate(title="Test Todo", completed=False)

    todo = await crud.create_todo(db_session, todo_data)

    assert todo.id is not None
    assert todo.title == "Test Todo"
    assert todo.completed is False
    assert todo.created_at is not None


@pytest.mark.asyncio
async def test_get_todo_not_found(db_session: AsyncSession):
    """Test getting a non-existent todo returns None."""
    from app import crud

    todo = await crud.get_todo(db_session, "nonexistent-id")

    assert todo is None
```

### API Endpoint Tests

```python
@pytest.mark.asyncio
async def test_create_todo_api(client: AsyncClient):
    """Test creating a todo via API."""
    response = await client.post(
        "/api/v1/todos",
        json={"title": "Test Todo", "completed": False}
    )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Todo"
    assert "id" in data


@pytest.mark.asyncio
async def test_get_todo_not_found(client: AsyncClient):
    """Test getting a non-existent todo returns 404."""
    response = await client.get("/api/v1/todos/nonexistent-id")

    assert response.status_code == 404
```

### Run Backend Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_crud.py

# Run specific test
pytest tests/test_api.py::test_create_todo_api
```

## Frontend Unit Testing (Jest + React Testing Library)

### Test Configuration

`frontend/jest.config.js`:

```javascript
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};

module.exports = createJestConfig(customJestConfig);
```

`frontend/jest.setup.js`:

```javascript
import "@testing-library/jest-dom";
```

### Component Tests

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TodoForm } from '@/components/TodoForm';
import * as queries from '@/services/queries';

// Mock React Query hook
jest.mock('@/services/queries');

describe('TodoForm', () => {
  let queryClient: QueryClient;
  const mockCreateTodo = jest.fn();

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    (queries.useCreateTodo as jest.Mock).mockReturnValue({
      mutate: mockCreateTodo,
      isPending: false,
    });
  });

  it('renders form with input and button', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TodoForm />
      </QueryClientProvider>
    );

    expect(screen.getByTestId('todo-input')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('shows validation error for empty title', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TodoForm />
      </QueryClientProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /add/i }));

    await waitFor(() => {
      expect(screen.getByText(/todo title is required/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    mockCreateTodo.mockImplementation((data, { onSuccess }) => {
      onSuccess({ id: '1', ...data });
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TodoForm />
      </QueryClientProvider>
    );

    const input = screen.getByTestId('todo-input');
    fireEvent.change(input, { target: { value: 'New Todo' } });
    fireEvent.click(screen.getByRole('button', { name: /add/i }));

    await waitFor(() => {
      expect(mockCreateTodo).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Todo',
          completed: false,
        }),
        expect.any(Object)
      );
    });
  });
});
```

**Patterns:**

- Mock React Query hooks with jest.mock
- Wrap components in QueryClientProvider
- Use Testing Library queries (getByTestId, getByRole, getByText)
- Use fireEvent for user interactions
- Use waitFor for async updates
- Test user workflows, not implementation details

### Run Frontend Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test -- TodoForm.test.tsx
```

## End-to-End Testing (Playwright)

### E2E Configuration

`frontend/playwright.config.ts`:

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Example

```typescript
import { test, expect } from "@playwright/test";
import { clearDatabase } from "./helpers/clear-database";

test.describe("Todo App - Happy Paths", () => {
  test.beforeEach(async () => {
    await clearDatabase();
  });

  test("should create a new todo", async ({ page }) => {
    await page.goto("/");

    // Fill in the form
    await page.getByTestId("todo-input").fill("Buy groceries");
    await page.getByRole("button", { name: /add/i }).click();

    // Verify the todo appears
    await expect(page.getByText("Buy groceries")).toBeVisible();
  });

  test("should toggle todo completion", async ({ page }) => {
    await page.goto("/");

    // Create a todo
    await page.getByTestId("todo-input").fill("Test todo");
    await page.getByRole("button", { name: /add/i }).click();

    // Toggle completion
    const checkbox = page.getByRole("checkbox").first();
    await checkbox.click();

    // Verify completed state
    await expect(checkbox).toBeChecked();
  });

  test("should delete a todo", async ({ page }) => {
    await page.goto("/");

    // Create a todo
    await page.getByTestId("todo-input").fill("Delete me");
    await page.getByRole("button", { name: /add/i }).click();

    // Delete it
    await page
      .getByRole("button", { name: /delete/i })
      .first()
      .click();

    // Verify it's gone
    await expect(page.getByText("Delete me")).not.toBeVisible();
  });
});
```

**Patterns:**

- Use Playwright's built-in assertions
- Clear database before each test
- Test full user workflows
- Use semantic locators (getByRole, getByTestId)
- Test real browser behavior

### Test Helpers

```typescript
// e2e/helpers/clear-database.ts
export async function clearDatabase() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const response = await fetch(`${API_URL}/api/v1/todos`);
  const data = await response.json();

  for (const todo of data.todos) {
    await fetch(`${API_URL}/api/v1/todos/${todo.id}`, {
      method: "DELETE",
    });
  }
}
```

### Run E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run in UI mode
npm run test:e2e:ui

# Run specific test
npx playwright test e2e/happy-paths.spec.ts
```

## Conventions

1. **Async Tests**: Use `@pytest.mark.asyncio` for backend, async/await for frontend
2. **Descriptive Names**: Test names should clearly state what is being tested
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Isolation**: Each test should be independent
5. **Test IDs**: Use data-testid for reliable element selection
6. **Mock External Calls**: Don't make real API calls in unit tests
7. **Clear Database**: E2E tests should clean up before/after
8. **Coverage**: Maintain high coverage for critical paths

## Summary

Testing in this project:

- Three-layer strategy (unit, integration, E2E)
- pytest for backend with async support
- Jest + RTL for frontend components
- Playwright for end-to-end workflows
- High isolation and independence
- Fast feedback with in-memory databases
