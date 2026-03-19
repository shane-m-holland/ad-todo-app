"""Application configuration settings."""

from typing import List
from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application settings and configuration.

    Attributes:
        PROJECT_NAME: The name of the project
        API_V1_PREFIX: API version 1 prefix path
        DATABASE_URL: PostgreSQL database connection URL
        ENVIRONMENT: Current environment (development, production, etc.)
        CORS_ORIGINS_STR: Comma-separated string of allowed CORS origins
    """

    PROJECT_NAME: str = "TODO API"
    API_V1_PREFIX: str = "/api/v1"
    DATABASE_URL: str = "sqlite+aiosqlite:///:memory:"
    ENVIRONMENT: str = "development"
    CORS_ORIGINS_STR: str = "http://localhost:3000"

    @computed_field
    @property
    def CORS_ORIGINS(self) -> List[str]:
        """Parse CORS_ORIGINS from comma-separated string."""
        return [origin.strip() for origin in self.CORS_ORIGINS_STR.split(",")]

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="allow")


# Global settings instance
settings = Settings()
