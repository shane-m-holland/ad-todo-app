"""Tests for API endpoints."""

import pytest
from httpx import AsyncClient


class TestTodoEndpoints:
    """Test cases for TODO API endpoints."""

    @pytest.mark.asyncio
    async def test_list_todos_empty(self, client: AsyncClient):
        """Test listing todos when database is empty."""
        # Act
        response = await client.get("/api/v1/todos")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["completed"] == 0
        assert len(data["todos"]) == 0

    @pytest.mark.asyncio
    async def test_create_todo(self, client: AsyncClient):
        """Test creating a new todo."""
        # Arrange
        todo_data = {"title": "Buy groceries", "completed": False}

        # Act
        response = await client.post("/api/v1/todos", json=todo_data)

        # Assert
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Buy groceries"
        assert data["completed"] is False
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

    @pytest.mark.asyncio
    async def test_create_todo_validation_error(self, client: AsyncClient):
        """Test creating a todo with invalid data."""
        # Arrange
        todo_data = {"title": "", "completed": False}  # Empty title

        # Act
        response = await client.post("/api/v1/todos", json=todo_data)

        # Assert
        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_list_todos_with_items(self, client: AsyncClient):
        """Test listing todos with multiple items."""
        # Arrange
        await client.post("/api/v1/todos", json={"title": "Task 1"})
        await client.post("/api/v1/todos", json={"title": "Task 2", "completed": True})
        await client.post("/api/v1/todos", json={"title": "Task 3"})

        # Act
        response = await client.get("/api/v1/todos")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 3
        assert data["completed"] == 1
        assert len(data["todos"]) == 3

    @pytest.mark.asyncio
    async def test_list_todos_with_pagination(self, client: AsyncClient):
        """Test listing todos with pagination."""
        # Arrange
        for i in range(5):
            await client.post("/api/v1/todos", json={"title": f"Task {i+1}"})

        # Act
        response1 = await client.get("/api/v1/todos?skip=0&limit=2")
        response2 = await client.get("/api/v1/todos?skip=2&limit=2")

        # Assert
        assert response1.status_code == 200
        assert response2.status_code == 200
        data1 = response1.json()
        data2 = response2.json()
        assert len(data1["todos"]) == 2
        assert len(data2["todos"]) == 2
        assert data1["todos"][0]["id"] != data2["todos"][0]["id"]

    @pytest.mark.asyncio
    async def test_list_todos_filter_completed(self, client: AsyncClient):
        """Test filtering todos by completion status."""
        # Arrange
        await client.post("/api/v1/todos", json={"title": "Task 1", "completed": False})
        await client.post("/api/v1/todos", json={"title": "Task 2", "completed": True})
        await client.post("/api/v1/todos", json={"title": "Task 3", "completed": False})

        # Act
        response_completed = await client.get("/api/v1/todos?completed=true")
        response_active = await client.get("/api/v1/todos?completed=false")

        # Assert
        assert response_completed.status_code == 200
        assert response_active.status_code == 200
        assert len(response_completed.json()["todos"]) == 1
        assert len(response_active.json()["todos"]) == 2

    @pytest.mark.asyncio
    async def test_get_todo_by_id(self, client: AsyncClient):
        """Test retrieving a specific todo by ID."""
        # Arrange
        create_response = await client.post("/api/v1/todos", json={"title": "Test task"})
        todo_id = create_response.json()["id"]

        # Act
        response = await client.get(f"/api/v1/todos/{todo_id}")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == todo_id
        assert data["title"] == "Test task"

    @pytest.mark.asyncio
    async def test_get_todo_not_found(self, client: AsyncClient):
        """Test retrieving a non-existent todo."""
        # Act
        response = await client.get("/api/v1/todos/nonexistent-id")

        # Assert
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_update_todo(self, client: AsyncClient):
        """Test updating a todo."""
        # Arrange
        create_response = await client.post("/api/v1/todos", json={"title": "Original"})
        todo_id = create_response.json()["id"]

        # Act
        update_data = {"title": "Updated title", "completed": True}
        response = await client.put(f"/api/v1/todos/{todo_id}", json=update_data)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated title"
        assert data["completed"] is True

    @pytest.mark.asyncio
    async def test_update_todo_partial(self, client: AsyncClient):
        """Test partially updating a todo."""
        # Arrange
        create_response = await client.post("/api/v1/todos", json={"title": "Original"})
        todo_id = create_response.json()["id"]

        # Act - only update completed status
        update_data = {"completed": True}
        response = await client.put(f"/api/v1/todos/{todo_id}", json=update_data)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Original"  # Title unchanged
        assert data["completed"] is True  # Status changed

    @pytest.mark.asyncio
    async def test_update_todo_not_found(self, client: AsyncClient):
        """Test updating a non-existent todo."""
        # Act
        update_data = {"title": "New title"}
        response = await client.put("/api/v1/todos/nonexistent-id", json=update_data)

        # Assert
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_todo(self, client: AsyncClient):
        """Test deleting a todo."""
        # Arrange
        create_response = await client.post("/api/v1/todos", json={"title": "To delete"})
        todo_id = create_response.json()["id"]

        # Act
        response = await client.delete(f"/api/v1/todos/{todo_id}")

        # Assert
        assert response.status_code == 204
        # Verify it's actually deleted
        get_response = await client.get(f"/api/v1/todos/{todo_id}")
        assert get_response.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_todo_not_found(self, client: AsyncClient):
        """Test deleting a non-existent todo."""
        # Act
        response = await client.delete("/api/v1/todos/nonexistent-id")

        # Assert
        assert response.status_code == 404
