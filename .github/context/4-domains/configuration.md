# Configuration Domain

## Overview

Configuration management uses environment-based settings with pydantic-settings for the backend and Next.js environment variables for the frontend. All configuration is type-safe and never hardcoded.

## Backend Configuration

### Configuration Class

`app/core/config.py`:

```python
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.

    All settings can be overridden via environment variables.
    For development, create a .env file in the backend directory.
    """

    # Application
    PROJECT_NAME: str = Field(default="Todo API", description="Project name")
    ENVIRONMENT: str = Field(default="development", description="Environment (development, production)")
    API_V1_PREFIX: str = Field(default="/api/v1", description="API v1 path prefix")

    # Database
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://todouser:todopass@localhost:5432/tododb",
        description="PostgreSQL database URL"
    )

    # CORS
    CORS_ORIGINS: list[str] = Field(
        default=["http://localhost:3000", "http://localhost:8000"],
        description="Allowed CORS origins"
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Global settings instance
settings = Settings()
```

**Patterns:**

- Inherit from `BaseSettings`
- Use `Field()` with defaults and descriptions
- Type hints for all settings
- Environment variables override defaults
- Load from `.env` file
- Create global `settings` instance

### Usage in Application

```python
from app.core.config import settings

# In main.py
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
)

# In database config
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.ENVIRONMENT == "development",
)

# In CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
)
```

### Environment Variables (.env)

```bash
# .env (not committed to git)
PROJECT_NAME=Todo API
ENVIRONMENT=development
DATABASE_URL=postgresql+asyncpg://todouser:todopass@localhost:5432/tododb
CORS_ORIGINS=["http://localhost:3000"]
```

**Conventions:**

- Never commit `.env` to version control
- Provide `.env.example` with placeholder values
- Use SCREAMING_SNAKE_CASE for env vars
- Database URLs include async driver (`postgresql+asyncpg`)

## Frontend Configuration

### Environment Variables

Next.js supports two types of environment variables:

1. **Server-side only** (default)
2. **Client-side** (prefixed with `NEXT_PUBLIC_`)

### Environment Files

```bash
# .env.local (not committed)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```bash
# .env.example (committed)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Usage in Code

```typescript
// services/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getTodos(): Promise<Todo[]> {
  const response = await fetch(`${API_URL}/api/v1/todos`);
  // ...
}
```

**Patterns:**

- Use `NEXT_PUBLIC_` prefix for client-accessible variables
- Provide fallback values with `||`
- Never hardcode URLs or endpoints

### TypeScript Environment Types

```typescript
// next-env.d.ts (auto-generated)
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// For custom env vars, create env.d.ts:
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_URL: string;
  }
}
```

## Docker Compose Configuration

`docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:16-alpine
    container_name: todo-db
    environment:
      POSTGRES_USER: todouser
      POSTGRES_PASSWORD: todopass
      POSTGRES_DB: tododb
    ports:
      - "5432:5432"

  backend:
    build:
      context: ./backend
    container_name: todo-backend
    environment:
      DATABASE_URL: postgresql+asyncpg://todouser:todopass@db:5432/tododb
      ENVIRONMENT: development
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend
    container_name: todo-frontend
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

**Patterns:**

- Define services for db, backend, frontend
- Use service names as hostnames (e.g., `db` instead of `localhost`)
- Set environment variables per service
- Use health checks and dependencies

## Testing Configuration

### Backend Test Config

```python
# tests/conftest.py
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# Override settings for testing
@pytest.fixture
def test_settings():
    return Settings(
        DATABASE_URL=TEST_DATABASE_URL,
        ENVIRONMENT="testing"
    )
```

### Frontend Test Config

```javascript
// jest.config.js
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};

module.exports = createJestConfig(customJestConfig);
```

## Build/Package Configuration

### Backend (pyproject.toml)

```toml
[project]
name = "todo-api"
version = "0.1.0"
description = "FastAPI TODO application with PostgreSQL"
requires-python = ">=3.12"
dependencies = [
    "fastapi>=0.110.0",
    "uvicorn[standard]>=0.27.0",
    "sqlalchemy>=2.0.25",
    "asyncpg>=0.29.0",
    "alembic>=1.13.0",
    "pydantic>=2.6.0",
    "pydantic-settings>=2.2.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0.0",
    "pytest-asyncio>=0.23.0",
    "pytest-cov>=4.1.0",
]
```

### Frontend (package.json)

```json
{
  "name": "todo-frontend",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "jest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "next": "^16.2.0",
    "react": "^18.3.1",
    "@tanstack/react-query": "^5.28.4"
  }
}
```

## TypeScript Configuration

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

**Key settings:**

- `strict: true` - Enable all strict type checks
- `paths` - Path aliases for imports (`@/` = project root)

## Conventions

1. **Environment-Based**: Use environment variables, not hardcoded values
2. **Type Safety**: All config values typed (Pydantic/TypeScript)
3. **Defaults**: Provide sensible defaults for development
4. **Documentation**: Use descriptions in Pydantic Fields
5. **Never Commit Secrets**: Add `.env` to `.gitignore`
6. **Provide Examples**: Include `.env.example` in repo
7. **Client Prefix**: Use `NEXT_PUBLIC_` for client-accessible env vars
8. **Database URLs**: Include driver in URL (`postgresql+asyncpg`)

## Anti-Patterns to Avoid

❌ **Don't hardcode URLs or secrets**

```python
# BAD
DATABASE_URL = "postgresql://user:pass@localhost/db"

# GOOD
DATABASE_URL: str = Field(default="postgresql://...")
```

❌ **Don't commit .env files**

```bash
# BAD - .env in git
git add .env

# GOOD - .env in .gitignore
echo ".env" >> .gitignore
```

❌ **Don't forget NEXT*PUBLIC* prefix for client vars**

```typescript
// BAD - Won't be available in browser
API_URL=http://localhost:8000

// GOOD
NEXT_PUBLIC_API_URL=http://localhost:8000
```

❌ **Don't skip type annotations**

```python
# BAD
class Settings(BaseSettings):
    database_url = "postgresql://..."

# GOOD
class Settings(BaseSettings):
    database_url: str = Field(default="postgresql://...")
```

## File Organization

```
backend/
  .env                   # Not committed
  .env.example          # Committed with placeholders
  app/
    core/
      config.py         # Settings class

frontend/
  .env.local            # Not committed
  .env.example          # Committed with placeholders

docker-compose.yml      # Container config
```

## Summary

Configuration in this project:

- Type-safe settings with Pydantic (backend)
- Environment variables for all configurable values
- Never hardcode secrets or URLs
- Provide examples, never commit real secrets
- Use proper prefixes for client-side vars
- Support multiple environments (dev, test, prod)
