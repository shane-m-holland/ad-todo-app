# Pydantic Schemas Style Guide

## Overview

Pydantic schemas define request/response shapes with validation rules. Use the four-schema pattern: Base, Create, Update, Response.

## File Location

- Path: `backend/app/schemas/`
- Example: `backend/app/schemas/todo.py`

## File Structure Template

```python
"""Pydantic schemas for {RESOURCE} API requests and responses."""

from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class {Resource}Base(BaseModel):
    """
    Base schema for {Resource} with common attributes.

    Attributes:
        field: Description
    """

    field: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Field description"
    )


class {Resource}Create({Resource}Base):
    """Schema for creating a new {Resource}."""
    pass


class {Resource}Update(BaseModel):
    """Schema for updating an existing {Resource}. All fields optional for partial updates."""

    field: str | None = Field(
        default=None,
        min_length=1,
        max_length=500,
        description="Field description",
    )


class {Resource}Response({Resource}Base):
    """Schema for {Resource} responses from the API."""

    id: str = Field(description="Unique identifier")
    created_at: datetime = Field(description="Creation timestamp")
    updated_at: datetime = Field(description="Last update timestamp")

    model_config = ConfigDict(from_attributes=True)
```

## Unique Patterns

1. **Four-Schema Pattern**: Base, Create, Update, Response for each model
2. **Inheritance**: Create inherits from Base
3. **Optional Updates**: All fields optional in Update schema
4. **Field Validation**: Use `Field()` with constraints
5. **Type Hints**: Modern syntax (`str | None` not `Optional[str]`)
6. **ORM Config**: `from_attributes=True` in Response schema
7. **Descriptions**: All fields have descriptions for API docs
8. **Required Fields**: Use `...` (Ellipsis) for required

## Validation Patterns

```python
# Required string with length constraints
title: str = Field(..., min_length=1, max_length=500)

# Optional string
title: str | None = Field(default=None, min_length=1, max_length=500)

# Boolean with default
is_active: bool = Field(default=True)

# Integer with range
count: int = Field(ge=0, le=1000)

# Enum
from enum import Enum
class Status(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"

status: Status = Field(default=Status.PENDING)
```

## Conventions

- Base class for common fields
- Create inherits from Base
- Update has all fields optional
- Response includes DB-generated fields
- Use `Field()` for all fields
- Include descriptions
- Use `from_attributes=True` for responses
- Modern type hints (`|` operator)
