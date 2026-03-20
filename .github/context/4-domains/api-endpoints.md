# API Endpoints Domain

## Overview

This domain covers RESTful API endpoint definitions using FastAPI. Endpoints are responsible for handling HTTP requests, managing request/response shapes through Pydantic schemas, and delegating business logic to the CRUD layer.

## Implementation Pattern

### Router Structure

```python
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import get_db
from app.schemas.todo import TodoCreate, TodoUpdate, TodoResponse, TodoList
from app import crud

router = APIRouter(prefix="/todos", tags=["todos"])
```

**Key Elements:**

- Use `APIRouter` with a prefix and tags for logical grouping
- Import dependencies at the top (FastAPI utilities, DB, schemas, CRUD)
- Router variable is named `router` consistently

### Endpoint Definition Pattern

#### List/Query Endpoint

```python
@router.get("", response_model=TodoList)
async def list_todos(
    skip: int = Query(default=0, ge=0, description="Number of records to skip"),
    limit: int = Query(
        default=100, ge=1, le=1000, description="Maximum number of records to return"
    ),
    completed: bool | None = Query(default=None, description="Filter by completion status"),
    db: AsyncSession = Depends(get_db),
) -> TodoList:
    """
    Retrieve a list of todos with optional filtering and pagination.

    Args:
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return
        completed: Optional filter by completion status (True/False)
        db: Database session dependency

    Returns:
        TodoList object containing list of todos and metadata
    """
    todos = await crud.get_todos(db, skip=skip, limit=limit, completed=completed)
    total = await crud.get_todo_count(db)
    completed_count = await crud.get_todo_count(db, completed=True)

    return TodoList(todos=todos, total=total, completed=completed_count)
```

**Patterns Observed:**

- Use `Query()` for query parameters with default values, constraints (`ge`, `le`), and descriptions
- Modern type hints: `bool | None` instead of `Optional[bool]`
- Database session injected via `Depends(get_db)`
- All database operations delegated to `crud` module
- Comprehensive docstring with Args and Returns sections
- Return type annotation matching response_model

#### Get Single Item Endpoint

```python
@router.get("/{todo_id}", response_model=TodoResponse)
async def get_todo(
    todo_id: str,
    db: AsyncSession = Depends(get_db),
) -> TodoResponse:
    """
    Retrieve a single todo by ID.

    Args:
        todo_id: ID of the todo to retrieve
        db: Database session dependency

    Returns:
        Todo object

    Raises:
        HTTPException: 404 if todo not found
    """
    todo = await crud.get_todo(db, todo_id)
    if todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with id {todo_id} not found"
        )
    return todo
```

**Patterns Observed:**

- Path parameters in route definition (`/{todo_id}`)
- Check for None and raise HTTPException with appropriate status code
- Use `status.HTTP_404_NOT_FOUND` constant, not magic numbers
- Detailed error messages that include the resource identifier
- Include Raises section in docstring

#### Create Endpoint

```python
@router.post("", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
async def create_todo(
    todo: TodoCreate,
    db: AsyncSession = Depends(get_db),
) -> TodoResponse:
    """
    Create a new todo item.

    Args:
        todo: TodoCreate schema with todo data
        db: Database session dependency

    Returns:
        Created Todo object
    """
    return await crud.create_todo(db, todo)
```

**Patterns Observed:**

- POST requests use empty string "" as path (resulting in /todos)
- Specify `status_code=status.HTTP_201_CREATED` for creation endpoints
- Request body automatically validated through Pydantic schema parameter
- Direct delegation to CRUD layer for simple operations

#### Update Endpoint

```python
@router.put("/{todo_id}", response_model=TodoResponse)
async def update_todo(
    todo_id: str,
    todo_update: TodoUpdate,
    db: AsyncSession = Depends(get_db),
) -> TodoResponse:
    """
    Update an existing todo item.

    Args:
        todo_id: ID of the todo to update
        todo_update: TodoUpdate schema with fields to update
        db: Database session dependency

    Returns:
        Updated Todo object

    Raises:
        HTTPException: 404 if todo not found
    """
    updated_todo = await crud.update_todo(db, todo_id, todo_update)
    if updated_todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with id {todo_id} not found"
        )
    return updated_todo
```

**Patterns Observed:**

- PUT for full updates (use PATCH if implementing partial updates)
- Both path parameter and request body
- CRUD returns None for not found, endpoint converts to 404
- Consistent error handling pattern

#### Delete Endpoint

```python
@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(
    todo_id: str,
    db: AsyncSession = Depends(get_db),
) -> None:
    """
    Delete a todo item.

    Args:
        todo_id: ID of the todo to delete
        db: Database session dependency

    Returns:
        None (204 No Content on success)

    Raises:
        HTTPException: 404 if todo not found
    """
    deleted = await crud.delete_todo(db, todo_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with id {todo_id} not found"
        )
```

**Patterns Observed:**

- DELETE returns 204 No Content (no response_model)
- Return type annotation is `None`
- CRUD returns boolean indicating success

### Router Registration

In `app/api/v1/__init__.py`:

```python
from fastapi import APIRouter
from app.api.v1.endpoints import todos

api_router = APIRouter()
api_router.include_router(todos.router)
```

In `app/main.py`:

```python
from app.api.v1 import api_router

app.include_router(api_router, prefix=settings.API_V1_PREFIX)
```

**Patterns:**

- Hierarchical router organization
- Version-specific routers (`v1/`)
- Centralized API prefix from settings

## Conventions

1. **Async All the Way**: Every endpoint handler is async
2. **Dependency Injection**: Use `Depends()` for database sessions, never create them manually
3. **Schema Validation**: All inputs/outputs use Pydantic schemas
4. **CRUD Separation**: No database logic in endpoints - delegate to CRUD layer
5. **HTTP Status Codes**: Use constants from `fastapi.status`
6. **Error Handling**: Raise HTTPException with descriptive messages
7. **Documentation**: Comprehensive docstrings with Args, Returns, Raises
8. **Type Hints**: Full type annotations on all parameters and return values

## Anti-Patterns to Avoid

❌ **Don't create database sessions directly in endpoints**

```python
# BAD
async def create_todo(todo: TodoCreate) -> TodoResponse:
    async with AsyncSessionLocal() as db:  # Don't do this
        ...
```

❌ **Don't put business logic in endpoints**

```python
# BAD
async def create_todo(todo: TodoCreate, db: AsyncSession = Depends(get_db)):
    db_todo = Todo(**todo.model_dump())  # Don't do this in endpoint
    db.add(db_todo)
    await db.commit()
```

❌ **Don't use magic numbers for status codes**

```python
# BAD
@router.post("", response_model=TodoResponse, status_code=201)  # Use status.HTTP_201_CREATED
```

❌ **Don't skip error handling**

```python
# BAD
async def get_todo(todo_id: str, db: AsyncSession = Depends(get_db)):
    return await crud.get_todo(db, todo_id)  # Could return None!
```

## Testing Pattern

```python
@pytest.mark.asyncio
async def test_create_todo(client: AsyncClient):
    response = await client.post(
        "/api/v1/todos",
        json={"title": "Test Todo", "completed": False}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Todo"
    assert "id" in data
```

## File Organization

```
app/
  api/
    __init__.py
    v1/
      __init__.py          # api_router aggregation
      endpoints/
        __init__.py
        todos.py            # Todo endpoints
        # users.py          # Additional endpoints (if needed)
```

## Summary

The API endpoints domain in this project follows a clean, separation-of-concerns approach where:

- Endpoints handle HTTP concerns (request/response, status codes, errors)
- Validation is declarative via Pydantic schemas
- Business logic is delegated to the CRUD layer
- Database sessions are injected via dependencies
- Everything is async and fully type-annotated
