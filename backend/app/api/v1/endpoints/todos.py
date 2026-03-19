"""API v1 endpoints for TODO operations."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import get_db
from app.schemas.todo import TodoCreate, TodoUpdate, TodoResponse, TodoList
from app import crud

router = APIRouter(prefix="/todos", tags=["todos"])


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
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Todo with id {todo_id} not found"
        )
    return todo


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


@router.put("/{todo_id}", response_model=TodoResponse)
async def update_todo(
    todo_id: str,
    todo: TodoUpdate,
    db: AsyncSession = Depends(get_db),
) -> TodoResponse:
    """
    Update an existing todo item.

    Args:
        todo_id: ID of the todo to update
        todo: TodoUpdate schema with fields to update
        db: Database session dependency

    Returns:
        Updated Todo object

    Raises:
        HTTPException: 404 if todo not found
    """
    updated_todo = await crud.update_todo(db, todo_id, todo)
    if updated_todo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Todo with id {todo_id} not found"
        )
    return updated_todo


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

    Raises:
        HTTPException: 404 if todo not found
    """
    deleted = await crud.delete_todo(db, todo_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Todo with id {todo_id} not found"
        )
