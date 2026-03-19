"""Application configuration settings."""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings and configuration.
    
    Attributes:
        PROJECT_NAME: The name of the project
        API_V1_PREFIX: API version 1 prefix path
        DATABASE_URL: PostgreSQL database connection URL
        ENVIRONMENT: Current environment (development, production, etc.)
        CORS_ORIGINS: List of allowed CORS origins
    """
    
    PROJECT_NAME: str = "TODO API"
    API_V1_PREFIX: str = "/api/v1"
    DATABASE_URL: str
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="allow"
    )


# Global settings instance
settings = Settings()
