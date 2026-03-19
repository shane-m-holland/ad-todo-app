"""Tests for main application endpoints."""

import pytest
from httpx import AsyncClient


class TestMainApp:
    """Test cases for main application endpoints."""

    @pytest.mark.asyncio
    async def test_root_endpoint(self, client: AsyncClient):
        """Test the root endpoint."""
        # Act
        response = await client.get("/")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert "docs" in data
        assert data["message"] == "TODO API"
        assert data["version"] == "0.1.0"

    @pytest.mark.asyncio
    async def test_health_check(self, client: AsyncClient):
        """Test the health check endpoint."""
        # Act
        response = await client.get("/health")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

    @pytest.mark.asyncio
    async def test_openapi_docs(self, client: AsyncClient):
        """Test that OpenAPI docs are accessible."""
        # Act
        response = await client.get("/api/v1/openapi.json")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "openapi" in data
        assert "info" in data
        assert data["info"]["title"] == "TODO API"
