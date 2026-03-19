# Contributing to TODO App

Thank you for considering contributing to this project! This document provides guidelines and instructions for development.

## 📋 Table of Contents

- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Running Tests](#running-tests)
- [Code Style](#code-style)
- [Making Changes](#making-changes)
- [Database Migrations](#database-migrations)
- [Debugging](#debugging)
- [Project Structure](#project-structure)

## 🚀 Development Setup

### Prerequisites

- Docker Desktop or Podman
- VS Code with Dev Containers extension
- Git

### Initial Setup

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd todo-app
   ```

2. **Open in Dev Container:**
   - Open the project in VS Code
   - When prompted, click "Reopen in Container"
   - Wait for the container to build and initialize

3. **Verify setup:**

   ```bash
   # Check Python version
   python --version  # Should be 3.12+

   # Check Node version
   node --version    # Should be 18+

   # Check uv is installed
   uv --version
   ```

## 🔄 Development Workflow

### Starting the Application

From the devcontainer terminal:

```bash
# Start all services (PostgreSQL, backend, frontend)
docker compose up

# Or run in detached mode (background)
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Running Services Individually

**Backend (FastAPI):**

```bash
cd backend

# Start development server with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or using uv
uv run uvicorn app.main:app --reload
```

**Frontend (Next.js):**

```bash
cd frontend

# Start development server
npm run dev

# Access at http://localhost:3000
```

## 🧪 Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
uv run pytest

# Run tests with coverage
uv run pytest --cov=app --cov-report=html

# Run specific test file
uv run pytest tests/test_api.py

# Run specific test function
uv run pytest tests/test_api.py::test_create_todo

# Run tests with verbose output
uv run pytest -v

# View coverage report
open htmlcov/index.html  # macOS
xdg-open htmlcov/index.html  # Linux
```

### Frontend Tests

```bash
cd frontend

# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests with Playwright
npm run test:e2e

# Run E2E tests in UI mode (interactive)
npm run test:e2e:ui

# View Playwright test report
npx playwright show-report
```

## 🎨 Code Style

### Backend (Python)

The project uses **Black** for formatting and **Flake8** for linting.

```bash
cd backend

# Format code with Black
uv run black .

# Check formatting without making changes
uv run black --check .

# Lint code with Flake8
uv run flake8 .

# Type checking with mypy
uv run mypy app
```

**Style Guidelines:**

- Line length: 100 characters
- Use type hints for all function parameters and return values
- Follow PEP 8 naming conventions
- Write docstrings for all public functions and classes (Google style)
- Use async/await for database operations

### Frontend (TypeScript/React)

The project uses **Prettier** for formatting and **ESLint** for linting.

```bash
cd frontend

# Lint code
npm run lint

# Format code (if configured)
npx prettier --write .
```

**Style Guidelines:**

- Use functional components with hooks
- Use TypeScript for type safety
- Write JSDoc comments for exported functions and components
- Use meaningful variable and function names
- Keep components small and focused on a single responsibility

## 🔨 Making Changes

### Git Workflow

1. **Create a feature branch:**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Write code
   - Add tests
   - Update documentation

3. **Run tests and linters:**

   ```bash
   # Backend
   cd backend
   uv run pytest --cov=app
   uv run black .
   uv run flake8 .

   # Frontend
   cd frontend
   npm test
   npm run lint
   ```

4. **Commit your changes:**

   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

   **Commit Message Format:**
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `test:` Adding or updating tests
   - `refactor:` Code refactoring
   - `style:` Code style changes (formatting, etc.)
   - `chore:` Maintenance tasks

5. **Push and create a pull request:**
   ```bash
   git push origin feature/your-feature-name
   ```

### Testing Requirements

- All new features must include tests
- Maintain or improve test coverage (target: 90%+)
- Backend: Write pytest tests in `backend/tests/`
- Frontend: Write Jest tests in `frontend/__tests__/`
- E2E: Add Playwright tests in `frontend/e2e/` for user flows

## 🗄️ Database Migrations

The project uses **Alembic** for database migrations.

### Creating a Migration

```bash
cd backend

# Create a new migration (auto-generate from model changes)
uv run alembic revision --autogenerate -m "description of changes"

# Create an empty migration (manual)
uv run alembic revision -m "description"
```

### Applying Migrations

```bash
# Apply all pending migrations
uv run alembic upgrade head

# Rollback one migration
uv run alembic downgrade -1

# View migration history
uv run alembic history

# View current revision
uv run alembic current
```

### Migration Best Practices

- Always review auto-generated migrations before applying
- Test migrations on a local database first
- Use descriptive migration messages
- Never edit applied migrations; create a new one instead
- Include both `upgrade()` and `downgrade()` operations

## 🐛 Debugging

### Backend Debugging

**Print Debugging:**

```python
print(f"Debug: {variable}")  # Simple print statements
```

**Logging:**

```python
import logging
logger = logging.getLogger(__name__)
logger.info("Info message")
logger.error("Error message")
```

**Interactive Debugging:**

```python
# Add breakpoint in code
breakpoint()

# Or use debugpy for VS Code debugging
# Set breakpoints in VS Code and use the Python debugger
```

### Frontend Debugging

**Console Logging:**

```typescript
console.log("Debug:", variable);
console.error("Error:", error);
```

**React Query DevTools:**
The project uses React Query DevTools for debugging cache and queries.
They appear automatically in development mode.

**Browser DevTools:**

- Use Chrome/Firefox DevTools for debugging
- React DevTools extension for component inspection
- Network tab for API request debugging

### Common Issues

**Backend won't start:**

- Check if PostgreSQL is running: `docker compose ps`
- Check environment variables in `backend/.env`
- Check logs: `docker compose logs backend`

**Frontend won't start:**

- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check if backend is running and accessible
- Check environment variables in `frontend/.env.local`

**Database connection errors:**

- Ensure PostgreSQL container is healthy: `docker compose ps`
- Check DATABASE_URL in backend/.env
- Try restarting services: `docker compose restart`

**Tests failing:**

- Clear test cache: `pytest --cache-clear` or `jest --clearCache`
- Check if services are running for E2E tests
- Review test logs for specific errors

## 📁 Project Structure

```
todo-app/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/v1/            # API route handlers
│   │   │   └── endpoints/     # Endpoint implementations
│   │   ├── core/              # Configuration and settings
│   │   ├── db/                # Database setup and session
│   │   ├── models/            # SQLAlchemy models
│   │   └── schemas/           # Pydantic schemas
│   ├── tests/                 # Pytest tests
│   ├── alembic/               # Database migrations
│   ├── pyproject.toml         # Python dependencies (uv)
│   └── Dockerfile             # Backend container
│
├── frontend/                   # Next.js frontend
│   ├── app/                   # Next.js App Router pages
│   ├── components/            # React components
│   ├── services/              # API client and queries
│   ├── types/                 # TypeScript type definitions
│   ├── __tests__/             # Jest/RTL unit tests
│   ├── e2e/                   # Playwright E2E tests
│   ├── package.json           # Node dependencies
│   └── Dockerfile             # Frontend container
│
├── .devcontainer/             # Dev container configuration
├── docker-compose.yml         # Service orchestration
└── README.md                  # Project documentation
```

## 📚 Additional Resources

### Documentation

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Playwright Documentation](https://playwright.dev/)

### Learning Resources

- [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Getting Help

If you encounter issues or have questions:

1. Check the [README.md](README.md) for common setup issues
2. Review existing issues in the project
3. Check the project documentation
4. Ask for help in the project's communication channels

## ✨ Code Review Guidelines

When reviewing pull requests, consider:

- **Functionality**: Does the code work as intended?
- **Tests**: Are there adequate tests with good coverage?
- **Code Quality**: Is the code clean, readable, and well-documented?
- **Performance**: Are there any performance concerns?
- **Security**: Are there any security vulnerabilities?
- **Documentation**: Are changes documented appropriately?

Thank you for contributing! 🎉
