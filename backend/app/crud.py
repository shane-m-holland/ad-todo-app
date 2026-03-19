"""CRUD operations for TODO items."""

from typing import Sequence
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoUpdate


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
