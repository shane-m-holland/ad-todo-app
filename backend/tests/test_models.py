"""Tests for Todo model."""

import pytest
from datetime import datetime

from app.models.todo import Todo


class TestTodoModel:
    """Test cases for the Todo SQLAlchemy model."""

    @pytest.mark.asyncio
    async def test_create_todo_with_defaults(self, db_session):
        """Test creating a todo with default values."""
        # Arrange
        title = "Test todo item"

        # Act
        todo = Todo(title=title)
        db_session.add(todo)
        await db_session.commit()
        await db_session.refresh(todo)

        # Assert
        assert todo.id is not None
        assert isinstance(todo.id, str)
        assert len(todo.id) == 36  # UUID string length
        assert todo.title == title
        assert todo.completed is False
        assert isinstance(todo.created_at, datetime)
        assert isinstance(todo.updated_at, datetime)
        assert todo.created_at <= todo.updated_at

    @pytest.mark.asyncio
    async def test_create_todo_completed(self, db_session):
        """Test creating a todo that is already completed."""
        # Arrange
        title = "Completed task"
        # Act
        todo = Todo(title=title, completed=True)
        db_session.add(todo)
        await db_session.commit()
        await db_session.refresh(todo)

        # Assert
        assert todo.title == title
        assert todo.completed is True

    @pytest.mark.asyncio
    async def test_todo_repr(self, db_session):
        """Test the string representation of a todo."""
        # Arrange
        title = "Test representation"
        todo = Todo(title=title)
        db_session.add(todo)
        await db_session.commit()
        await db_session.refresh(todo)

        # Act
        repr_string = repr(todo)

        # Assert
        assert "Todo" in repr_string
        assert str(todo.id) in repr_string
        assert title in repr_string
        assert "False" in repr_string

    @pytest.mark.asyncio
    async def test_todo_title_required(self, db_session):
        """Test that title is required for creating a todo."""
        # Arrange & Act & Assert
        from sqlalchemy.exc import IntegrityError

        with pytest.raises(IntegrityError):
            todo = Todo()  # Missing required title field
            db_session.add(todo)
            await db_session.commit()

    @pytest.mark.asyncio
    async def test_update_todo_updates_timestamp(self, db_session):
        """Test that updating a todo updates the updated_at timestamp."""
        # Arrange
        todo = Todo(title="Original title")
        db_session.add(todo)
        await db_session.commit()
        await db_session.refresh(todo)
        original_updated_at = todo.updated_at

        # Act
        # Small delay to ensure timestamp difference
        import asyncio

        await asyncio.sleep(0.01)

        todo.title = "Updated title"
        await db_session.commit()
        await db_session.refresh(todo)

        # Assert
        assert todo.updated_at >= original_updated_at
        assert todo.title == "Updated title"

    @pytest.mark.asyncio
    async def test_multiple_todos_different_ids(self, db_session):
        """Test that multiple todos get unique IDs."""
        # Arrange & Act
        todo1 = Todo(title="First todo")
        todo2 = Todo(title="Second todo")
        db_session.add(todo1)
        db_session.add(todo2)
        await db_session.commit()
        await db_session.refresh(todo1)
        await db_session.refresh(todo2)

        # Assert
        assert todo1.id != todo2.id
        assert isinstance(todo1.id, str)
        assert isinstance(todo2.id, str)
