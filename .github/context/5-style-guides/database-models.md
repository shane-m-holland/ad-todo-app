# Database Models Style Guide

## Overview

Database models use SQLAlchemy 2.0+ with async support, `Mapped` type hints, and `mapped_column` for column definitions.

## File Location

- Path: `backend/app/models/`
- Example: `backend/app/models/todo.py`

## File Structure Template

```python
"""SQLAlchemy model for {RESOURCE} items."""

import uuid
from datetime import datetime
from sqlalchemy import Boolean, String, DateTime, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class {Resource}(Base):
    """
    {Resource} model representing {description}.

    Attributes:
        id: Unique identifier (UUID) for the item
        {field}: Description of field
        created_at: Timestamp when created
        updated_at: Timestamp when last updated
    """

    __tablename__ = "{resources}"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
        doc="Unique identifier",
    )

    # Other fields here

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        doc="Timestamp when created",
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        doc="Timestamp when last updated",
    )

    def __repr__(self) -> str:
        return f"<{Resource}(id={self.id}, ...)>"
```

## Unique Patterns

1. **Base Class**: Inherit from `Base`
2. **Table Name**: Explicit `__tablename__` in plural snake_case
3. **Type Annotations**: Use `Mapped[Type]` for all columns
4. **Primary Key**: UUID string using `uuid.uuid4()`
5. **Timestamps**: Always include `created_at` and `updated_at`
6. **Indexes**: Add indexes on frequently queried columns
7. **Doc Strings**: Use `doc` parameter for column documentation
8. **Nullable**: Explicitly set `nullable=False` for required fields
9. **Repr**: Implement `__repr__` for debugging

## Column Type Mapping

```python
# String (with length)
title: Mapped[str] = mapped_column(String(500), nullable=False)

# Text (unlimited length)
description: Mapped[str] = mapped_column(Text, nullable=False)

# Boolean
is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

# Integer
count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

# DateTime
created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

# Optional field
optional_field: Mapped[str | None] = mapped_column(String(100), nullable=True)
```

## Index Patterns

```python
# Single column index
completed: Mapped[bool] = mapped_column(Boolean, index=True)

# Primary key (automatically indexed)
id: Mapped[str] = mapped_column(String(36), primary_key=True)
```

## Conventions

- UUID primary keys (not integers)
- Always include timestamps
- Use `Mapped[Type]` annotations
- Explicit `nullable=False` for required fields
- String columns have max length
- Boolean fields have defaults
- Add `doc` for documentation
