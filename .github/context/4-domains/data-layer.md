# Data Layer (CRUD) Domain

## Overview

The data layer provides a clean abstraction between API endpoints and the database. All database operations are centralized in CRUD functions that accept an AsyncSession and return typed results. This separation ensures endpoints remain thin and focused on HTTP concerns while business logic lives in a testable, reusable layer.

## Implementation Pattern

### Module Structure

All CRUD operations are in `app/crud.py` (or `app/crud/` directory for larger applications):

```python
"""CRUD operations for TODO items."""

from typing import Sequence
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoUpdate
```

### CRUD Function Patterns

#### Read Single Item

```python
async def get_todo(db: AsyncSession, todo_id: str) -> Todo | None:
    """
    Retrieve a single todo by ID.

    Args:
        db: Database session
        todo_id: ID of the todo to retrieve

    Returns:
        Todo object if found, None otherwise
    """
    result = await db.execute(select(Todo).where(Todo.id == todo_id))
    return result.scalar_one_or_none()
```

**Patterns:**

- First parameter is always `AsyncSession`
- Return `Model | None` for items that might not exist
- Use `scalar_one_or_none()` for single result
- Use SQLAlchemy 2.0 `select()` style
- Comprehensive docstring with Args and Returns

#### Read Multiple Items with Filtering

```python
async def get_todos(
    db: AsyncSession, skip: int = 0, limit: int = 100, completed: bool | None = None
) -> Sequence[Todo]:
    """
    Retrieve a list of todos with optional filtering.

    Args:
        db: Database session
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return
        completed: Optional filter by completion status

    Returns:
        List of Todo objects
    """
    query = select(Todo).order_by(Todo.created_at.desc())

    if completed is not None:
        query = query.where(Todo.completed == completed)

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()
```

**Patterns:**

- Return `Sequence[Model]` for multiple results
- Use `.scalars().all()` to get list of objects
- Build query incrementally for conditional filters
- Include pagination parameters (skip, limit)
- Default sorting (newest first)

#### Count Items

```python
async def get_todo_count(db: AsyncSession, completed: bool | None = None) -> int:
    """
    Get the count of todos, optionally filtered by completion status.

    Args:
        db: Database session
        completed: Optional filter by completion status

    Returns:
        Count of todos matching the filter
    """
    query = select(func.count()).select_from(Todo)

    if completed is not None:
        query = query.where(Todo.completed == completed)

    result = await db.execute(query)
    return result.scalar_one()
```

**Patterns:**

- Use `func.count()` for counting
- Use `scalar_one()` to get single integer result
- Support same filters as the list function

#### Create Item

```python
async def create_todo(db: AsyncSession, todo: TodoCreate) -> Todo:
    """
    Create a new todo item.

    Args:
        db: Database session
        todo: TodoCreate schema with todo data

    Returns:
        Created Todo object
    """
    db_todo = Todo(**todo.model_dump())
    db.add(db_todo)
    await db.flush()  # Flush to generate ID and timestamps without committing
    await db.refresh(db_todo)  # Refresh to get DB-generated values
    return db_todo
```

**Patterns:**

- Accept Pydantic schema, convert to model
- Use `.model_dump()` to extract data
- Call `db.add()` to add to session
- Call `await db.flush()` NOT `await db.commit()`
- Call `await db.refresh()` to get DB-generated values (ID, timestamps)
- Return the created object

#### Update Item

```python
async def update_todo(db: AsyncSession, todo_id: str, todo_update: TodoUpdate) -> Todo | None:
    """
    Update an existing todo item.

    Args:
        db: Database session
        todo_id: ID of the todo to update
        todo_update: TodoUpdate schema with fields to update

    Returns:
        Updated Todo object if found, None otherwise
    """
    db_todo = await get_todo(db, todo_id)
    if db_todo is None:
        return None

    # Update only provided fields (exclude_unset=True skips None values)
    # This allows partial updates - e.g., changing only title or
    # only completed status
    update_data = todo_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_todo, field, value)

    # Flush changes to DB but don't commit yet (handled by dependency)
    await db.flush()
    # Refresh to get any DB-generated values (like updated_at)
    await db.refresh(db_todo)
    return db_todo
```

**Patterns:**

- Reuse get function to fetch existing item
- Return None if not found (let endpoint handle 404)
- Use `.model_dump(exclude_unset=True)` for partial updates
- Use `setattr()` to update fields dynamically
- Flush and refresh to get DB-generated values

#### Delete Item

```python
async def delete_todo(db: AsyncSession, todo_id: str) -> bool:
    """
    Delete a todo item.

    Args:
        db: Database session
        todo_id: ID of the todo to delete

    Returns:
        True if todo was deleted, False if not found
    """
    db_todo = await get_todo(db, todo_id)
    if db_todo is None:
        return False

    await db.delete(db_todo)
    await db.flush()
    return True
```

**Patterns:**

- Return boolean indicating success
- Check existence before attempting delete
- Use `await db.delete()`
- Flush but don't commit

## Key Conventions

1. **Session First**: First parameter is always `AsyncSession` named `db`
2. **Async Functions**: All CRUD functions are async
3. **Type Annotations**: Full type hints on parameters and returns
4. **None for Not Found**: Return None, don't raise exceptions
5. **Flush Don't Commit**: Use `flush()`, let dependency handle commit
6. **Refresh After Flush**: Use `refresh()` to get DB-generated values
7. **Partial Updates**: Use `model_dump(exclude_unset=True)` for updates
8. **Query Building**: Build queries incrementally for flexibility
9. **Comprehensive Docs**: Every function has docstring
10. **SQLAlchemy 2.0**: Use `select()` not legacy `Query` API

## Separation of Concerns

### What CRUD Functions Do:

✅ Database queries and operations
✅ Data transformation (schema to model and vice versa)
✅ Business logic that doesn't involve HTTP
✅ Return typed results

### What CRUD Functions Don't Do:

❌ Raise HTTPException (that's for endpoints)
❌ Handle request/response formatting
❌ Commit transactions (handled by dependency)
❌ Validate input (handled by Pydantic schemas)
❌ Handle authentication/authorization

## Testing Pattern

```python
@pytest.mark.asyncio
async def test_create_todo(db_session: AsyncSession):
    """Test creating a new todo."""
    todo_data = TodoCreate(title="Test Todo", completed=False)

    todo = await crud.create_todo(db_session, todo_data)

    assert todo.id is not None
    assert todo.title == "Test Todo"
    assert todo.completed is False
    assert todo.created_at is not None

@pytest.mark.asyncio
async def test_get_todo_not_found(db_session: AsyncSession):
    """Test getting a non-existent todo returns None."""
    todo = await crud.get_todo(db_session, "nonexistent-id")

    assert todo is None
```

**Test Patterns:**

- Test CRUD functions directly with test database session
- Test success cases and edge cases (not found, etc.)
- Don't test HTTP concerns (that's for endpoint tests)

## Anti-Patterns to Avoid

❌ **Don't commit in CRUD functions**

```python
# BAD
async def create_todo(db: AsyncSession, todo: TodoCreate) -> Todo:
    db_todo = Todo(**todo.model_dump())
    db.add(db_todo)
    await db.commit()  # Don't commit, use flush()
    return db_todo
```

❌ **Don't raise HTTPException**

```python
# BAD
async def get_todo(db: AsyncSession, todo_id: str) -> Todo:
    result = await db.execute(select(Todo).where(Todo.id == todo_id))
    todo = result.scalar_one_or_none()
    if not todo:
        raise HTTPException(status_code=404)  # Let endpoint handle this
    return todo
```

❌ **Don't skip refresh after flush**

```python
# BAD
async def create_todo(db: AsyncSession, todo: TodoCreate) -> Todo:
    db_todo = Todo(**todo.model_dump())
    db.add(db_todo)
    await db.flush()
    return db_todo  # Missing refresh - won't have DB-generated values
```

❌ **Don't use old Query API**

```python
# BAD
async def get_todos(db: AsyncSession) -> List[Todo]:
    return await db.query(Todo).all()  # Old style

# GOOD
async def get_todos(db: AsyncSession) -> Sequence[Todo]:
    result = await db.execute(select(Todo))
    return result.scalars().all()
```

## File Organization

For small projects:

```
app/
  crud.py           # All CRUD operations
```

For larger projects:

```
app/
  crud/
    __init__.py
    todo.py         # Todo CRUD operations
    user.py         # User CRUD operations (if added)
```

## Summary

The CRUD layer in this project provides:

- Clean separation from HTTP concerns
- Reusable, testable database operations
- Type-safe interfaces
- Consistent patterns across all operations
- Foundation for business logic without HTTP coupling
