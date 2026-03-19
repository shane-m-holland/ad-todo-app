"""FastAPI TODO application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings

# Create FastAPI application instance
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="A simple TODO application API built with FastAPI and PostgreSQL",
    version="0.1.0",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root() -> dict[str, str]:
    """
    Root endpoint that returns a welcome message.
    
    Returns:
        dict: A welcome message with API information
    """
    return {
        "message": "TODO API",
        "version": "0.1.0",
        "docs": f"{settings.API_V1_PREFIX}/docs",
    }


@app.get("/health")
async def health_check() -> dict[str, str]:
    """
    Health check endpoint for monitoring and container orchestration.
    
    Returns:
        dict: Health status of the application
    """
    return {"status": "healthy"}


# Import and include routers will be added here later
# from app.api.v1.endpoints import todos
# app.include_router(todos.router, prefix=settings.API_V1_PREFIX)
