"""SQLAlchemy model for TODO items."""

import uuid
from datetime import datetime, UTC
from sqlalchemy import Boolean, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Todo(Base):
    """
    Todo model representing a task in the TODO list.

    Attributes:
        id: Unique identifier (UUID) for the todo item
        title: The title/description of the todo task
        completed: Boolean flag indicating if the task is completed
        created_at: Timestamp when the todo was created
        updated_at: Timestamp when the todo was last updated
    """

    __tablename__ = "todos"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
        doc="Unique identifier for the todo item",
    )

    title: Mapped[str] = mapped_column(
        String(500), nullable=False, doc="Title or description of the todo task"
    )

    completed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        index=True,
        doc="Whether the task has been completed",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(UTC),
        nullable=False,
        doc="Timestamp when the todo was created",
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
        nullable=False,
        doc="Timestamp when the todo was last updated",
    )

    def __repr__(self) -> str:
        """String representation of the Todo model."""
        return f"<Todo(id={self.id}, title='{self.title}', completed={self.completed})>"
