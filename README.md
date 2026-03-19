# TODO Application

A modern full-stack TODO application built with FastAPI, Next.js, and PostgreSQL.

## 🏗️ Architecture

- **Backend**: FastAPI (Python 3.12) with async SQLAlchemy
- **Frontend**: Next.js 14 with React and TypeScript
- **Database**: PostgreSQL 16
- **Package Management**: uv (Python), npm (Node.js)
- **Development**: DevContainers with Docker Compose orchestration

## ✨ Features

### Core Functionality

- ✅ Create new todos with validation
- ✅ Mark todos as complete/incomplete
- ✅ Edit todo titles (double-click or use edit button)
- ✅ Delete todos with confirmation
- ✅ Real-time statistics (total, active, completed)
- ✅ Separate sections for active and completed tasks

### Technical Features

- ✅ Async FastAPI with async SQLAlchemy for high performance
- ✅ RESTful API with proper HTTP status codes
- ✅ UUID primary keys for security
- ✅ Comprehensive API documentation (Swagger/ReDoc)
- ✅ Optimistic UI updates with React Query
- ✅ Smooth animations with Framer Motion
- ✅ Form validation with React Hook Form
- ✅ Accessible UI components
- ✅ Responsive design with Tailwind CSS
- ✅ Database migrations with Alembic
- ✅ CORS configuration for local development

### Testing & Quality

- ✅ Backend unit tests (88% coverage)
- ✅ Frontend unit tests (91% coverage)
- ✅ End-to-end tests with Playwright
- ✅ Type safety with TypeScript and Pydantic
- ✅ Code formatting (Black, Prettier)
- ✅ Linting (Flake8, ESLint)

## 🚀 Quick Start

### Prerequisites

- **Docker Desktop** or **Podman** (with socket enabled)
- **VS Code** with Dev Containers extension

#### Podman Setup (macOS/Linux)

If using Podman instead of Docker, ensure the Podman socket is available:

```bash
# Start Podman machine (macOS)
podman machine start

# Verify socket location (should be /var/run/docker.sock or auto-configured)
podman info --format '{{.Host.RemoteSocket.Path}}'

# If using a custom socket location, set DOCKER_HOST before opening VS Code:
export DOCKER_HOST=unix:///run/user/$(id -u)/podman/podman.sock
```

### Setup

1. Clone the repository
2. Open the project in VS Code
3. When prompted, click "Reopen in Container"
4. Wait for the devcontainer to build and start

The post-create script will automatically:

- Install `uv` for Python package management
- Install Python dependencies
- Install Node.js dependencies
- Install Playwright browsers

### Running the Application

From the devcontainer terminal:

```bash
# Start all services (PostgreSQL, backend, frontend)
docker compose up

# Or run in detached mode
docker compose up -d
```

Access the application:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/api/v1/docs
- PostgreSQL: localhost:5432

### Development Workflow

**Backend Development:**

```bash
cd backend

# Run the FastAPI development server
uvicorn app.main:app --reload

# Run tests with coverage
uv run pytest --cov=app --cov-report=html

# Format code
uv run black .

# Lint code
uv run flake8 .

# Create a new migration
uv run alembic revision --autogenerate -m "description"

# Apply migrations
uv run alembic upgrade head
```

**Frontend Development:**

```bash
cd frontend

# Run the Next.js development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run Playwright e2e tests
npx playwright test

# Show Playwright test report
npx playwright show-report
```

## 📁 Project Structure

```
todo-app/
├── .devcontainer/
│   ├── devcontainer.json      # Dev container configuration
│   └── post-create.sh          # Setup script
├── backend/
│   ├── alembic/                # Database migrations
│   ├── app/
│   │   ├── api/v1/endpoints/   # API route handlers
│   │   ├── core/               # Config & settings
│   │   ├── db/                 # Database setup
│   │   ├── models/             # SQLAlchemy models
│   │   ├── schemas/            # Pydantic schemas
│   │   └── main.py             # FastAPI app entry
│   ├── tests/                  # Pytest tests
│   ├── Dockerfile              # Backend container
│   ├── pyproject.toml          # Python dependencies (uv)
│   └── alembic.ini             # Alembic config
├── frontend/
│   ├── components/             # React components
│   ├── pages/                  # Next.js pages
│   ├── services/               # API client
│   ├── e2e/                    # Playwright tests
│   ├── tests/                  # Jest/RTL tests
│   ├── Dockerfile              # Frontend container
│   └── package.json            # Node dependencies
└── docker-compose.yml          # Service orchestration
```

## 🧪 Testing

The project targets 90%+ test coverage for both backend and frontend.

**Backend Testing:**

- Unit tests with pytest
- Async test support with pytest-asyncio
- Coverage reports with pytest-cov

**Frontend Testing:**

- Unit/Integration tests with Jest and React Testing Library
- End-to-end tests with Playwright (happy paths + error scenarios)

## 📝 API Documentation

Once the backend is running, interactive API documentation is available at:

- Swagger UI: http://localhost:8000/api/v1/docs
- ReDoc: http://localhost:8000/api/v1/redoc

### API Endpoints

All TODO endpoints are prefixed with `/api/v1/todos`:

| Method | Endpoint             | Description                          | Request Body | Response                            |
| ------ | -------------------- | ------------------------------------ | ------------ | ----------------------------------- |
| GET    | `/api/v1/todos`      | List all todos with optional filters | -            | `TodoList` (todos array + metadata) |
| GET    | `/api/v1/todos/{id}` | Get a specific todo by ID            | -            | `TodoResponse`                      |
| POST   | `/api/v1/todos`      | Create a new todo                    | `TodoCreate` | `TodoResponse`                      |
| PUT    | `/api/v1/todos/{id}` | Update an existing todo              | `TodoUpdate` | `TodoResponse`                      |
| DELETE | `/api/v1/todos/{id}` | Delete a todo                        | -            | 204 No Content                      |

### Query Parameters for List Endpoint

- `skip` (int, default: 0): Number of records to skip for pagination
- `limit` (int, default: 100): Maximum number of records to return
- `completed` (bool, optional): Filter by completion status

### Data Schemas

**TodoCreate** (for creating todos):

```json
{
  "title": "string (1-500 chars, required)",
  "completed": "boolean (optional, default: false)"
}
```

**TodoUpdate** (for updating todos, all fields optional):

```json
{
  "title": "string (1-500 chars, optional)",
  "completed": "boolean (optional)"
}
```

**TodoResponse** (returned from API):

```json
{
  "id": "string (UUID)",
  "title": "string",
  "completed": "boolean",
  "created_at": "datetime (ISO 8601)",
  "updated_at": "datetime (ISO 8601)"
}
```

## 🔧 Configuration

### Backend Environment Variables

Backend configuration is managed through environment variables (can be set in `backend/.env`):

| Variable           | Description                          | Default                                                 |
| ------------------ | ------------------------------------ | ------------------------------------------------------- |
| `DATABASE_URL`     | PostgreSQL connection string         | `postgresql+asyncpg://todouser:todopass@db:5432/tododb` |
| `ENVIRONMENT`      | Current environment                  | `development`                                           |
| `PROJECT_NAME`     | API project name                     | `TODO API`                                              |
| `API_V1_PREFIX`    | API version prefix                   | `/api/v1`                                               |
| `CORS_ORIGINS_STR` | Comma-separated allowed CORS origins | `http://localhost:3000`                                 |

### Frontend Environment Variables

Frontend configuration (can be set in `frontend/.env.local`):

| Variable              | Description          | Default                 |
| --------------------- | -------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |

### Database Schema

The application uses a single `todos` table with the following structure:

```sql
CREATE TABLE todos (
    id VARCHAR(36) PRIMARY KEY,           -- UUID as string
    title VARCHAR(500) NOT NULL,          -- Todo title/description
    completed BOOLEAN NOT NULL DEFAULT FALSE,  -- Completion status
    created_at TIMESTAMP NOT NULL,        -- Creation timestamp
    updated_at TIMESTAMP NOT NULL         -- Last update timestamp
);
```

## 📋 Current Status

- ✅ Phase 1: Project Setup & Infrastructure (Complete)
- ✅ Phase 2: Frontend Design Selection (Complete - Modern Tailwind design)
- ✅ Phase 3: Backend Implementation (Complete - 88% test coverage)
- ✅ Phase 4: Frontend Implementation (Complete - 91% test coverage)
- ✅ Phase 5: End-to-End Testing (Complete - Playwright tests passing)
- ✅ Phase 6: Documentation & Polish (Complete)

## 🛠️ Tech Stack Details

### Backend

- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy 2.0**: Async ORM for database operations
- **Alembic**: Database migration tool
- **Pydantic**: Data validation using Python type hints
- **asyncpg**: Async PostgreSQL driver
- **uv**: Fast Python package installer and resolver

### Frontend

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **React Query (@tanstack/react-query)**: Server state management and caching
- **React Hook Form**: Form validation and state management
- **Framer Motion**: Smooth animations and transitions
- **Tailwind CSS**: Utility-first CSS framework
- **Playwright**: End-to-end testing framework
- **Jest & React Testing Library**: Unit and integration testing

### Development Tools

- **Black**: Python code formatter (line length: 100)
- **Flake8**: Python linter (configured to match Black)
- **ESLint**: JavaScript/TypeScript linter
- **Prettier**: Code formatter for JS/TS
- **Docker Compose**: Multi-container orchestration
- **DevContainers**: Consistent development environment
- **uv**: Fast Python package installer

## 🧪 Test Coverage

The project maintains high test coverage:

- **Backend**: 88% coverage (target: 90%+)
  - All CRUD operations tested
  - API endpoint integration tests
  - Model validation tests
- **Frontend**: 91% coverage (target: 90%+)
  - Component unit tests
  - API service tests
  - User interaction tests
- **End-to-End**: Full user flow coverage
  - Happy path scenarios (create, read, update, delete)
  - Error scenarios (validation, network errors)

## 🐛 Troubleshooting

### Services won't start

**Problem**: `docker compose up` fails or containers exit immediately

**Solutions**:

1. Check Docker is running: `docker ps`
2. Remove old volumes: `docker compose down -v`
3. Rebuild containers: `docker compose up --build`
4. Check logs: `docker compose logs backend` or `docker compose logs frontend`

### Backend connection errors

**Problem**: Frontend can't connect to backend

**Solutions**:

1. Verify backend is running: `curl http://localhost:8000/health`
2. Check NEXT_PUBLIC_API_URL in frontend .env.local
3. Verify CORS settings in backend/app/core/config.py
4. Check Docker network: `docker network ls`

### Database migration issues

**Problem**: Database schema doesn't match models

**Solutions**:

```bash
cd backend

# Check current migration status
uv run alembic current

# View migration history
uv run alembic history

# Rollback one migration if needed
uv run alembic downgrade -1

# Apply all migrations
uv run alembic upgrade head
```

### Test failures

**Problem**: Tests are failing unexpectedly

**Solutions**:

1. Clear test cache: `pytest --cache-clear` or `jest --clearCache`
2. Ensure services are running for E2E tests
3. Check for database issues: restart PostgreSQL container
4. Update dependencies: `uv sync` or `npm install`

### Port conflicts

**Problem**: Port 3000, 8000, or 5432 already in use

**Solutions**:

1. Stop conflicting services
2. Change ports in docker-compose.yml
3. Update environment variables accordingly

## 📖 License

MIT

## 🔗 Quick Reference

### Useful URLs (when running)

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs (Swagger): http://localhost:8000/api/v1/docs
- API Docs (ReDoc): http://localhost:8000/api/v1/redoc
- Health Check: http://localhost:8000/health

### Common Commands

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f

# Restart a service
docker compose restart backend

# Backend tests with coverage
cd backend && uv run pytest --cov=app --cov-report=html

# Frontend tests with coverage
cd frontend && npm run test:coverage

# E2E tests
cd frontend && npm run test:e2e

# Format backend code
cd backend && uv run black .

# Lint backend code
cd backend && uv run flake8 .

# Apply database migrations
cd backend && uv run alembic upgrade head

# Create new migration
cd backend && uv run alembic revision --autogenerate -m "description"
```

### Project Links

- [CONTRIBUTING.md](CONTRIBUTING.md) - Development guidelines
- [todo-app-plan.md](todo-app-plan.md) - Original project plan
