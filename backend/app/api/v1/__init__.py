"""API v1 package."""

from fastapi import APIRouter
from app.api.v1.endpoints import todos

api_router = APIRouter()
api_router.include_router(todos.router)

__all__ = ["api_router"]
