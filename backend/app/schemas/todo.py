"""Pydantic schemas for TODO API requests and responses."""

from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


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


class TodoCreate(TodoBase):
    """
    Schema for creating a new Todo.

    Inherits all fields from TodoBase.
    Used for POST requests to create new todos.
    """

    pass


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
    completed: bool | None = Field(default=None, description="Whether the task has been completed")


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


class TodoList(BaseModel):
    """
    Schema for a list of todos with metadata.

    Attributes:
        todos: List of todo items
        total: Total number of todos
        completed: Number of completed todos
    """

    todos: list[TodoResponse] = Field(description="List of todo items")
    total: int = Field(description="Total number of todos")
    completed: int = Field(description="Number of completed todos")
