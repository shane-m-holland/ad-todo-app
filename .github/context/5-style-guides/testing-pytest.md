# Pytest Testing Style Guide

## Overview

Backend tests use pytest with async support, in-memory SQLite database, and httpx for API testing.

## File Location

- Path: `backend/tests/`
- Examples: `backend/tests/test_crud.py`, `backend/tests/test_api.py`

## File Structure Template

```python
"""Tests for {module} functionality."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud
from app.schemas.{resource} import {Resource}Create, {Resource}Update


@pytest.mark.asyncio
async def test_create_{resource}(db_session: AsyncSession):
    """Test creating a new {resource}."""
    {resource}_data = {Resource}Create(field="value", another_field=True)

    {resource} = await crud.create_{resource}(db_session, {resource}_data)

    assert {resource}.id is not None
    assert {resource}.field == "value"
    assert {resource}.another_field is True
    assert {resource}.created_at is not None


@pytest.mark.asyncio
async def test_get_{resource}_not_found(db_session: AsyncSession):
    """Test getting a non-existent {resource} returns None."""
    {resource} = await crud.get_{resource}(db_session, "nonexistent-id")

    assert {resource} is None


@pytest.mark.asyncio
async def test_create_{resource}_api(client: AsyncClient):
    """Test creating a {resource} via API."""
    response = await client.post(
        "/api/v1/{resources}",
        json={"field": "value", "another_field": True}
    )

    assert response.status_code == 201
    data = response.json()
    assert data["field"] == "value"
    assert "id" in data


@pytest.mark.asyncio
async def test_get_{resource}_not_found_api(client: AsyncClient):
    """Test getting a non-existent {resource} returns 404."""
    response = await client.get("/api/v1/{resources}/nonexistent-id")

    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
```

## Unique Patterns

1. **Async Tests**: All tests marked with `@pytest.mark.asyncio`
2. **Fixtures**: Use `db_session` for CRUD tests, `client` for API tests
3. **Descriptive Names**: Test names clearly state what is tested
4. **Docstrings**: Every test has a docstring
5. **AAA Pattern**: Arrange, Act, Assert structure
6. **Test Isolation**: Each test is independent
7. **Assertions**: Multiple assertions to verify state
8. **Error Cases**: Test both success and failure paths

## Test Categories

### CRUD Tests (test with `db_session`)

```python
@pytest.mark.asyncio
async def test_function_name(db_session: AsyncSession):
    """Test description."""
    # Arrange
    data = Schema(field="value")

    # Act
    result = await crud.function(db_session, data)

    # Assert
    assert result.field == "value"
```

### API Tests (test with `client`)

```python
@pytest.mark.asyncio
async def test_endpoint_name(client: AsyncClient):
    """Test description."""
    # Act
    response = await client.post("/api/v1/endpoint", json={"field": "value"})

    # Assert
    assert response.status_code == 201
    assert response.json()["field"] == "value"
```

## Common Assertions

```python
# Existence
assert result is not None
assert result is None

# Status codes
assert response.status_code == 200
assert response.status_code == 201
assert response.status_code == 404

# Field values
assert item.field == "expected"
assert item.completed is True

# Response JSON
data = response.json()
assert data["field"] == "value"
assert "id" in data

# Collections
assert len(items) == 5
assert all(item.field == "value" for item in items)
```

## Test Naming Convention

- File: `test_{module}.py`
- Function: `test_{action}_{resource}_{condition}`
- Examples: `test_create_todo`, `test_get_todo_not_found`, `test_update_todo_api`

## Conventions

- Mark all tests with `@pytest.mark.asyncio`
- Include docstrings
- Use fixtures (`db_session`, `client`)
- Test both success and error cases
- Multiple assertions per test
- Descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
