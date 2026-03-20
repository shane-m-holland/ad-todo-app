# Validation Domain

## Overview

Request/response validation in this project uses Pydantic v2 schemas. Schemas define the shape and validation rules for data entering and leaving the API, ensuring type safety and data integrity at the API boundaries.

## Schema Pattern Overview

The project follows a four-schema pattern for each model:

1. **Base Schema**: Common fields shared across schemas
2. **Create Schema**: Fields required for creating new items
3. **Update Schema**: Fields that can be updated (all optional for partial updates)
4. **Response Schema**: Full object returned from API including DB-generated fields

## Implementation Examples

### Base Schema

```python
from pydantic import BaseModel, Field


class TodoBase(BaseModel):
    """
    Base schema for Todo with common attributes.

    Attributes:
        title: The title/description of the todo task
        completed: Whether the task is completed (defaults to False)
    """

    title: str = Field(
        ..., min_length=1, max_length=500, description="Title or description of the todo task"
    )
    completed: bool = Field(default=False, description="Whether the task has been completed")
```

**Patterns:**

- Contains fields common to multiple schemas
- Uses `Field()` for validation and documentation
- `...` (Ellipsis) means required field
- `min_length`, `max_length` for string constraints
- `description` for OpenAPI documentation
- Default values using `default=` parameter

### Create Schema

```python
class TodoCreate(TodoBase):
    """
    Schema for creating a new Todo.

    Inherits all fields from TodoBase.
    Used for POST requests to create new todos.
    """

    pass
```

**Patterns:**

- Inherits from Base schema
- Simple `pass` if no additional fields needed
- All inherited fields maintain their validation rules
- Used in POST endpoint request body

### Update Schema

```python
class TodoUpdate(BaseModel):
    """
    Schema for updating an existing Todo.

    All fields are optional to allow partial updates.

    Attributes:
        title: Optional new title for the todo
        completed: Optional new completion status
    """

    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=500,
        description="Title or description of the todo task",
    )
    completed: bool | None = Field(
        default=None,
        description="Whether the task has been completed"
    )
```

**Patterns:**

- All fields are optional (`Type | None` with `default=None`)
- Allows partial updates (only send fields to change)
- Maintains same validation rules as base schema
- Does NOT inherit from Base (to avoid making all fields required)
- Used in PUT/PATCH endpoint request body
- Endpoint uses `.model_dump(exclude_unset=True)` to only update provided fields

### Response Schema

```python
from datetime import datetime
from pydantic import ConfigDict


class TodoResponse(TodoBase):
    """
    Schema for Todo responses from the API.

    Includes all TodoBase fields plus database-generated fields.

    Attributes:
        id: Unique identifier for the todo
        created_at: Timestamp when the todo was created
        updated_at: Timestamp when the todo was last updated
    """

    id: str = Field(description="Unique identifier for the todo item")
    created_at: datetime = Field(description="Timestamp when the todo was created")
    updated_at: datetime = Field(description="Timestamp when the todo was last updated")

    model_config = ConfigDict(from_attributes=True)
```

**Patterns:**

- Inherits from Base to include user-provided fields
- Adds database-generated fields (id, timestamps)
- Uses `model_config = ConfigDict(from_attributes=True)` for ORM compatibility
- This allows Pydantic to convert SQLAlchemy models to schemas
- Used in endpoint `response_model` parameter

### List Response Schema

```python
class TodoList(BaseModel):
    """
    Schema for a list of todos with metadata.

    Attributes:
        todos: List of todo items
        total: Total number of todos
        completed: Number of completed todos
    """

    todos: list[TodoResponse] = Field(description="List of todo items")
    total: int = Field(description="Total count of all todos")
    completed: int = Field(description="Count of completed todos")
```

**Patterns:**

- Wraps list of items with metadata
- Uses nested schema (`list[TodoResponse]`)
- Provides useful counts for UI (total, completed)
- Better than raw list for API evolution

## Field Validation Techniques

### String Validation

```python
title: str = Field(
    ...,                              # Required
    min_length=1,                     # At least 1 character
    max_length=500,                   # No more than 500 characters
    description="Todo title"          # OpenAPI description
)
```

### Optional Fields

```python
title: str | None = Field(
    default=None,                     # Optional, defaults to None
    min_length=1,                     # Still validated if provided
    max_length=500
)
```

### Boolean with Default

```python
completed: bool = Field(
    default=False,                    # Defaults to False if not provided
    description="Completion status"
)
```

### Datetime Fields

```python
from datetime import datetime

created_at: datetime = Field(
    description="Creation timestamp"
)
```

## Custom Validators

For more complex validation:

```python
from pydantic import field_validator


class TodoCreate(TodoBase):
    @field_validator('title')
    @classmethod
    def title_must_not_be_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Title cannot be empty or whitespace only')
        return v.strip()
```

**Note**: This project doesn't currently use custom validators, but this pattern is available if needed.

## Configuration

### Pydantic V2 Config

```python
from pydantic import ConfigDict

model_config = ConfigDict(
    from_attributes=True,              # Enable ORM mode (convert SQLAlchemy models)
    str_strip_whitespace=True,         # Automatically strip whitespace from strings
    validate_assignment=True,          # Validate on attribute assignment
)
```

**This project uses**: `from_attributes=True` in response schemas to convert ORM models.

## Usage in Endpoints

### Request Validation

```python
@router.post("", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
async def create_todo(
    todo: TodoCreate,                  # Automatically validates request body
    db: AsyncSession = Depends(get_db),
) -> TodoResponse:
    return await crud.create_todo(db, todo)
```

### Response Validation

```python
@router.get("/{todo_id}", response_model=TodoResponse)
async def get_todo(
    todo_id: str,
    db: AsyncSession = Depends(get_db),
) -> TodoResponse:                     # Return type matches response_model
    todo = await crud.get_todo(db, todo_id)
    if todo is None:
        raise HTTPException(status_code=404)
    return todo                        # SQLAlchemy model automatically converted
```

## Conversion Between Schemas and Models

### Schema to Model (Create)

```python
# In CRUD function
def create_todo(db: AsyncSession, todo: TodoCreate) -> Todo:
    db_todo = Todo(**todo.model_dump())  # Convert schema to dict, unpack to model
    # ...
```

### Model to Schema (Response)

```python
# Automatic with response_model and from_attributes=True
# SQLAlchemy model is automatically converted to Pydantic schema
return db_todo  # FastAPI handles conversion
```

### Partial Updates

```python
# In CRUD function
def update_todo(db: AsyncSession, todo_id: str, todo_update: TodoUpdate) -> Todo | None:
    db_todo = await get_todo(db, todo_id)

    # Only get fields that were actually provided
    update_data = todo_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_todo, field, value)
```

## Validation Error Responses

FastAPI automatically returns validation errors:

```json
{
  "detail": [
    {
      "type": "string_too_short",
      "loc": ["body", "title"],
      "msg": "String should have at least 1 character",
      "input": "",
      "ctx": { "min_length": 1 }
    }
  ]
}
```

Status code: `422 Unprocessable Entity`

## Conventions

1. **Four-Schema Pattern**: Base, Create, Update, Response for each model
2. **Inheritance**: Use inheritance for shared fields
3. **Field Descriptions**: Always provide descriptions for OpenAPI docs
4. **Type Hints**: Use modern syntax (`str | None` not `Optional[str]`)
5. **Validation Rules**: Use `Field()` for constraints
6. **ORM Compatibility**: Use `from_attributes=True` for response schemas
7. **Optional Updates**: All fields optional in Update schema
8. **No Model Imports**: Schemas should not import database models
9. **Consistent Naming**: `{Model}Base`, `{Model}Create`, `{Model}Update`, `{Model}Response`

## Anti-Patterns to Avoid

❌ **Don't use Optional[T] (old syntax)**

```python
# BAD
from typing import Optional
title: Optional[str] = None

# GOOD
title: str | None = None
```

❌ **Don't make update fields required**

```python
# BAD - Update schema with required fields
class TodoUpdate(BaseModel):
    title: str  # Forces client to send all fields

# GOOD - All optional for partial updates
class TodoUpdate(BaseModel):
    title: str | None = None
```

❌ **Don't forget ConfigDict in response schemas**

```python
# BAD
class TodoResponse(TodoBase):
    id: str
    # Missing: model_config = ConfigDict(from_attributes=True)

# GOOD
class TodoResponse(TodoBase):
    id: str
    model_config = ConfigDict(from_attributes=True)
```

❌ **Don't validate in endpoints**

```python
# BAD - Manual validation
async def create_todo(todo: TodoCreate):
    if len(todo.title) < 1:
        raise HTTPException(400, "Title too short")
    # Validation should be in schema

# GOOD - Let Pydantic handle it
title: str = Field(min_length=1, max_length=500)
```

## File Organization

```
app/
  schemas/
    __init__.py
    todo.py          # All Todo schemas
```

## Summary

The validation domain provides:

- Declarative validation rules via Pydantic
- Automatic request/response validation
- Type safety across API boundaries
- Clear OpenAPI documentation
- Seamless ORM integration
