# API Endpoints Style Guide

## Overview

API endpoints in this project use FastAPI with async handlers, dependency injection, and Pydantic schemas for validation.

## File Location

- Path: `backend/app/api/v1/endpoints/`
- Example: `backend/app/api/v1/endpoints/todos.py`

## File Structure Template

```python
"""API v1 endpoints for {RESOURCE} operations."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.base import get_db
from app.schemas.{resource} import {Resource}Create, {Resource}Update, {Resource}Response
from app import crud

router = APIRouter(prefix="/{resources}", tags=["{resources}"])


@router.get("", response_model=list[{Resource}Response])
async def list_{resources}(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
) -> list[{Resource}Response]:
    """List all {resources}."""
    return await crud.get_{resources}(db, skip=skip, limit=limit)
```

## Unique Patterns

1. **Router Definition**: Always use `APIRouter(prefix="/resource", tags=["resource"])`
2. **Async All Handlers**: Every endpoint function is `async def`
3. **Dependency Injection**: Database session via `Depends(get_db)`
4. **Query Parameters**: Use `Query()` with `default`, `ge`, `le` constraints
5. **Response Models**: Always specify `response_model` on decorator
6. **HTTP Status**: Use `status.HTTP_*` constants, not magic numbers
7. **Error Handling**: Check for None, raise `HTTPException` with descriptive messages
8. **Type Hints**: Full type annotations on parameters and return types
9. **Docstrings**: Include Args, Returns, and Raises sections

## Endpoint Patterns

### List (GET collection)

```python
@router.get("", response_model=ListResponse)
async def list_items(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
    filter_param: Type | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> ListResponse:
```

### Get Single (GET item)

```python
@router.get("/{item_id}", response_model=Response)
async def get_item(
    item_id: str,
    db: AsyncSession = Depends(get_db),
) -> Response:
    item = await crud.get_item(db, item_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Item {item_id} not found")
    return item
```

### Create (POST)

```python
@router.post("", response_model=Response, status_code=status.HTTP_201_CREATED)
async def create_item(
    item: CreateSchema,
    db: AsyncSession = Depends(get_db),
) -> Response:
    return await crud.create_item(db, item)
```

### Update (PUT)

```python
@router.put("/{item_id}", response_model=Response)
async def update_item(
    item_id: str,
    item_update: UpdateSchema,
    db: AsyncSession = Depends(get_db),
) -> Response:
    updated = await crud.update_item(db, item_id, item_update)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Item {item_id} not found")
    return updated
```

### Delete (DELETE)

```python
@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    item_id: str,
    db: AsyncSession = Depends(get_db),
) -> None:
    deleted = await crud.delete_item(db, item_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Item {item_id} not found")
```

## Router Registration

In `app/api/v1/__init__.py`:

```python
from fastapi import APIRouter
from app.api.v1.endpoints import todos, items

api_router = APIRouter()
api_router.include_router(todos.router)
api_router.include_router(items.router)
```

## Naming Conventions

- File: `{resource_plural}.py` (e.g., `todos.py`)
- Router variable: `router`
- Functions: `{verb}_{resource}` (e.g., `create_todo`, `list_todos`)
- Path parameters: `{resource}_id` (e.g., `todo_id`)
