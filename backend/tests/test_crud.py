"""Tests for CRUD operations."""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud
from app.models.todo import Todo
from app.schemas.todo import TodoCreate, TodoUpdate


class TestCRUD:
    """Test cases for CRUD operations."""

    @pytest.mark.asyncio
    async def test_create_todo(self, db_session: AsyncSession):
        """Test creating a new todo."""
        # Arrange
        todo_data = TodoCreate(title="Buy groceries", completed=False)

        # Act
        todo = await crud.create_todo(db_session, todo_data)

        # Assert
        assert todo.id is not None
        assert todo.title == "Buy groceries"
        assert todo.completed is False
        assert todo.created_at is not None
        assert todo.updated_at is not None

    @pytest.mark.asyncio
    async def test_get_todo(self, db_session: AsyncSession):
        """Test retrieving a todo by ID."""
        # Arrange
        todo_data = TodoCreate(title="Test task")
        created_todo = await crud.create_todo(db_session, todo_data)

        # Act
        retrieved_todo = await crud.get_todo(db_session, created_todo.id)

        # Assert
        assert retrieved_todo is not None
        assert retrieved_todo.id == created_todo.id
        assert retrieved_todo.title == "Test task"

    @pytest.mark.asyncio
    async def test_get_todo_not_found(self, db_session: AsyncSession):
        """Test retrieving a non-existent todo."""
        # Act
        todo = await crud.get_todo(db_session, "nonexistent-id")

        # Assert
        assert todo is None

    @pytest.mark.asyncio
    async def test_get_todos_empty(self, db_session: AsyncSession):
        """Test retrieving todos from empty database."""
        # Act
        todos = await crud.get_todos(db_session)

        # Assert
        assert len(todos) == 0

    @pytest.mark.asyncio
    async def test_get_todos_with_items(self, db_session: AsyncSession):
        """Test retrieving multiple todos."""
        # Arrange
        await crud.create_todo(db_session, TodoCreate(title="Task 1"))
        await crud.create_todo(db_session, TodoCreate(title="Task 2"))
        await crud.create_todo(db_session, TodoCreate(title="Task 3"))

        # Act
        todos = await crud.get_todos(db_session)

        # Assert
        assert len(todos) == 3
        # Verify they're ordered by created_at desc
        assert todos[0].title == "Task 3"
        assert todos[2].title == "Task 1"

    @pytest.mark.asyncio
    async def test_get_todos_with_pagination(self, db_session: AsyncSession):
        """Test retrieving todos with pagination."""
        # Arrange
        for i in range(5):
            await crud.create_todo(db_session, TodoCreate(title=f"Task {i+1}"))

        # Act
        todos_page_1 = await crud.get_todos(db_session, skip=0, limit=2)
        todos_page_2 = await crud.get_todos(db_session, skip=2, limit=2)

        # Assert
        assert len(todos_page_1) == 2
        assert len(todos_page_2) == 2
        assert todos_page_1[0].id != todos_page_2[0].id

    @pytest.mark.asyncio
    async def test_get_todos_filter_completed(self, db_session: AsyncSession):
        """Test retrieving todos filtered by completion status."""
        # Arrange
        await crud.create_todo(db_session, TodoCreate(title="Task 1", completed=False))
        await crud.create_todo(db_session, TodoCreate(title="Task 2", completed=True))
        await crud.create_todo(db_session, TodoCreate(title="Task 3", completed=False))

        # Act
        completed_todos = await crud.get_todos(db_session, completed=True)
        active_todos = await crud.get_todos(db_session, completed=False)

        # Assert
        assert len(completed_todos) == 1
        assert completed_todos[0].title == "Task 2"
        assert len(active_todos) == 2

    @pytest.mark.asyncio
    async def test_get_todo_count(self, db_session: AsyncSession):
        """Test counting todos."""
        # Arrange
        await crud.create_todo(db_session, TodoCreate(title="Task 1"))
        await crud.create_todo(db_session, TodoCreate(title="Task 2", completed=True))

        # Act
        total_count = await crud.get_todo_count(db_session)
        completed_count = await crud.get_todo_count(db_session, completed=True)
        active_count = await crud.get_todo_count(db_session, completed=False)

        # Assert
        assert total_count == 2
        assert completed_count == 1
        assert active_count == 1

    @pytest.mark.asyncio
    async def test_update_todo(self, db_session: AsyncSession):
        """Test updating a todo."""
        # Arrange
        todo_data = TodoCreate(title="Original title")
        created_todo = await crud.create_todo(db_session, todo_data)

        # Act
        update_data = TodoUpdate(title="Updated title", completed=True)
        updated_todo = await crud.update_todo(db_session, created_todo.id, update_data)

        # Assert
        assert updated_todo is not None
        assert updated_todo.id == created_todo.id
        assert updated_todo.title == "Updated title"
        assert updated_todo.completed is True

    @pytest.mark.asyncio
    async def test_update_todo_partial(self, db_session: AsyncSession):
        """Test partially updating a todo."""
        # Arrange
        todo_data = TodoCreate(title="Original title", completed=False)
        created_todo = await crud.create_todo(db_session, todo_data)

        # Act - only update completed status
        update_data = TodoUpdate(completed=True)
        updated_todo = await crud.update_todo(db_session, created_todo.id, update_data)

        # Assert
        assert updated_todo is not None
        assert updated_todo.title == "Original title"  # Title unchanged
        assert updated_todo.completed is True  # Status changed

    @pytest.mark.asyncio
    async def test_update_todo_not_found(self, db_session: AsyncSession):
        """Test updating a non-existent todo."""
        # Act
        update_data = TodoUpdate(title="New title")
        updated_todo = await crud.update_todo(db_session, "nonexistent-id", update_data)

        # Assert
        assert updated_todo is None

    @pytest.mark.asyncio
    async def test_delete_todo(self, db_session: AsyncSession):
        """Test deleting a todo."""
        # Arrange
        todo_data = TodoCreate(title="To be deleted")
        created_todo = await crud.create_todo(db_session, todo_data)

        # Act
        deleted = await crud.delete_todo(db_session, created_todo.id)

        # Assert
        assert deleted is True
        # Verify it's actually gone
        retrieved_todo = await crud.get_todo(db_session, created_todo.id)
        assert retrieved_todo is None

    @pytest.mark.asyncio
    async def test_delete_todo_not_found(self, db_session: AsyncSession):
        """Test deleting a non-existent todo."""
        # Act
        deleted = await crud.delete_todo(db_session, "nonexistent-id")

        # Assert
        assert deleted is False
