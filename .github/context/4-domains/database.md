# Database Domain

## Overview

This domain covers database models, session management, and migrations using SQLAlchemy 2.0+ with async support and Alembic for schema migrations. The project uses PostgreSQL in production/development and SQLite for testing.

## Database Models

### Model Definition Pattern

All models use SQLAlchemy 2.0 declarative mapping with `Mapped` type annotations:

```python
import uuid
from datetime import datetime
from sqlalchemy import Boolean, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Todo(Base):
    """
    Todo model representing a task in the TODO list.

    Attributes:
        id: Unique identifier (UUID) for the todo item
        title: The title/description of the todo task
        completed: Boolean flag indicating if the task is completed
        created_at: Timestamp when the todo was created
        updated_at: Timestamp when the todo was last updated
    """

    __tablename__ = "todos"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True,
        doc="Unique identifier for the todo item",
    )

    title: Mapped[str] = mapped_column(
        String(500), nullable=False, doc="Title or description of the todo task"
    )

    completed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        index=True,
        doc="Whether the task has been completed",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        doc="Timestamp when the todo was created",
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        doc="Timestamp when the todo was last updated",
    )

    def __repr__(self) -> str:
        return f"<Todo(id={self.id}, title={self.title}, completed={self.completed})>"
```

### Model Conventions

1. **Base Class**: All models inherit from `Base` (declarative_base)
2. **Table Name**: Explicit `__tablename__` in plural form
3. **Type Annotations**: Use `Mapped[Type]` for all columns
4. **Primary Keys**: UUID strings (not integers) using `uuid.uuid4()`
5. **Timestamps**: Include `created_at` and `updated_at` with automatic defaults
6. **Indexes**: Add indexes on frequently queried columns (id, completed)
7. **Doc Strings**: Use `doc` parameter in `mapped_column` for column documentation
8. **Nullable**: Explicitly set `nullable=False` for required fields
9. **String Lengths**: Specify max length for strings (String(500))
10. **Repr**: Implement `__repr__` for debugging

## Session Management

### Database Configuration

Located in `app/db/base.py`:

```python
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base

from app.core.config import settings

# Create async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.ENVIRONMENT == "development",
    future=True,
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Base class for SQLAlchemy models
Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency that provides database session.

    Yields:
        AsyncSession: Database session that auto-commits on success
        and rolls back on exception.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
```

### Session Conventions

1. **Async Only**: All database operations use `AsyncSession`
2. **Dependency Injection**: Sessions injected via `Depends(get_db)` in endpoints
3. **Auto-commit**: Session commits automatically at end of request
4. **Auto-rollback**: Session rolls back on any exception
5. **Connection Pooling**: Handled by SQLAlchemy engine
6. **Echo Mode**: SQL logging enabled in development environment

### Usage in CRUD Functions

```python
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

async def get_todo(db: AsyncSession, todo_id: str) -> Todo | None:
    result = await db.execute(select(Todo).where(Todo.id == todo_id))
    return result.scalar_one_or_none()
```

**Key Patterns:**

- Use `select()` for queries (SQLAlchemy 2.0 style)
- Use `await db.execute()` for async execution
- Use `.scalar_one_or_none()` for single results
- Use `.scalars().all()` for multiple results
- Use `await db.flush()` not `await db.commit()` (commit handled by dependency)
- Use `await db.refresh(obj)` after flush to get DB-generated values

## Database Migrations

### Alembic Configuration

Located in `backend/alembic.ini`:

- Migration directory: `alembic/versions/`
- Script template: `alembic/script.py.mako`

### Migration Environment

Located in `backend/alembic/env.py`:

```python
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config
from alembic import context

from app.core.config import settings
from app.db.base import Base

# Import all models to register them with Base.metadata
from app.models import Todo  # noqa: F401

config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)
target_metadata = Base.metadata
```

**Key Points:**

- Models must be imported in `env.py` to be detected
- Database URL comes from settings, not hardcoded
- Uses `Base.metadata` for table definitions
- Supports async migrations

### Migration File Example

Located in `backend/alembic/versions/001_create_todos_table.py`:

```python
"""create todos table

Revision ID: 001
Create Date: 2024-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'todos',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('completed', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_todos_id'), 'todos', ['id'], unique=False)
    op.create_index(op.f('ix_todos_completed'), 'todos', ['completed'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_todos_completed'), table_name='todos')
    op.drop_index(op.f('ix_todos_id'), table_name='todos')
    op.drop_table('todos')
```

### Migration Workflow

1. **Create Migration**: `alembic revision --autogenerate -m "message"`
2. **Review Migration**: Check generated file in `alembic/versions/`
3. **Apply Migration**: `alembic upgrade head`
4. **Rollback**: `alembic downgrade -1`

## Testing Database Setup

For tests, use in-memory SQLite:

```python
import pytest
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest_asyncio.fixture(scope="function")
async def test_db_engine():
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()
```

**Test Database Patterns:**

- Use SQLite in-memory for fast, isolated tests
- Create schema before each test
- Drop schema after each test
- Use `StaticPool` to keep connection alive
- Disable echo to reduce test output

## Conventions Summary

1. **Async Everywhere**: All operations are async
2. **Type Safety**: Full type annotations with `Mapped[T]`
3. **UUID Primary Keys**: String UUIDs, not integer IDs
4. **Timestamps**: Always include created_at and updated_at
5. **Migrations**: All schema changes via Alembic
6. **Session Lifecycle**: Managed by dependency injection
7. **No Raw SQL**: Use ORM, not raw SQL queries
8. **Test Isolation**: In-memory database for each test

## Anti-Patterns to Avoid

❌ **Don't use synchronous SQLAlchemy**

```python
# BAD
from sqlalchemy import create_engine
engine = create_engine(url)  # Use create_async_engine
```

❌ **Don't create sessions manually in endpoints**

```python
# BAD
async def create_todo(todo: TodoCreate):
    async with AsyncSessionLocal() as db:  # Use Depends(get_db)
        ...
```

❌ **Don't call commit in CRUD functions**

```python
# BAD
async def create_todo(db: AsyncSession, todo: TodoCreate):
    db_todo = Todo(**todo.model_dump())
    db.add(db_todo)
    await db.commit()  # Use flush(), commit is handled by dependency
```

❌ **Don't modify models without migrations**

```python
# BAD - Change model and run directly
# GOOD - Create migration first with alembic
```

❌ **Don't use old-style SQLAlchemy declarations**

```python
# BAD
class Todo(Base):
    __tablename__ = "todos"
    id = Column(String(36), primary_key=True)  # Old style

# GOOD
class Todo(Base):
    __tablename__ = "todos"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)  # New style
```
