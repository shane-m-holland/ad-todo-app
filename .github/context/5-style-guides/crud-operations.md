# CRUD Operations Style Guide

## Overview

CRUD functions provide a data access layer that separates database operations from API endpoints. All functions are async and use AsyncSession.

## File Location

- Path: `backend/app/crud.py` (or `backend/app/crud/` for multiple files)
- Example: `backend/app/crud.py`

## File Structure Template

```python
"""CRUD operations for {RESOURCE} items."""

from typing import Sequence
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.{resource} import {Resource}
from app.schemas.{resource} import {Resource}Create, {Resource}Update


async def get_{resource}(db: AsyncSession, {resource}_id: str) -> {Resource} | None:
    """Retrieve a single {resource} by ID."""
    result = await db.execute(select({Resource}).where({Resource}.id == {resource}_id))
    return result.scalar_one_or_none()


async def get_{resources}(
    db: AsyncSession, skip: int = 0, limit: int = 100
) -> Sequence[{Resource}]:
    """Retrieve a list of {resources}."""
    query = select({Resource}).order_by({Resource}.created_at.desc())
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


async def create_{resource}(db: AsyncSession, item: {Resource}Create) -> {Resource}:
    """Create a new {resource}."""
    db_item = {Resource}(**item.model_dump())
    db.add(db_item)
    await db.flush()
    await db.refresh(db_item)
    return db_item


async def update_{resource}(
    db: AsyncSession, {resource}_id: str, item_update: {Resource}Update
) -> {Resource} | None:
    """Update an existing {resource}."""
    db_item = await get_{resource}(db, {resource}_id)
    if db_item is None:
        return None

    update_data = item_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_item, field, value)

    await db.flush()
    await db.refresh(db_item)
    return db_item


async def delete_{resource}(db: AsyncSession, {resource}_id: str) -> bool:
    """Delete a {resource}."""
    db_item = await get_{resource}(db, {resource}_id)
    if db_item is None:
        return False

    await db.delete(db_item)
    await db.flush()
    return True
```

## Unique Patterns

1. **Session First**: First parameter always `AsyncSession` named `db`
2. **Async Functions**: All CRUD functions are async
3. **Return None**: Return None for not found, don't raise exceptions
4. **Flush Not Commit**: Use `flush()`, let dependency handle commit
5. **Refresh After Flush**: Call `refresh()` to get DB-generated values
6. **Type Annotations**: Full type hints on all parameters and returns
7. **SQLAlchemy 2.0**: Use `select()` not legacy Query API
8. **Partial Updates**: Use `model_dump(exclude_unset=True)`

## Query Patterns

```python
# Single item
result = await db.execute(select(Model).where(Model.id == id))
return result.scalar_one_or_none()

# Multiple items
query = select(Model).order_by(Model.created_at.desc())
result = await db.execute(query)
return result.scalars().all()

# Count
query = select(func.count()).select_from(Model)
result = await db.execute(query)
return result.scalar_one()

# With filter
query = select(Model).where(Model.field == value)
```

## Conventions

- Function names: `get_`, `create_`, `update_`, `delete_`
- Return `Model | None` for get functions
- Return `Sequence[Model]` for list functions
- Return `bool` for delete functions
- Use `model_dump()` to convert schemas
- Use `setattr()` for dynamic updates
- Include comprehensive docstrings
