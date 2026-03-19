# TODO Application

A modern full-stack TODO application built with FastAPI, Next.js, and PostgreSQL.

## 🏗️ Architecture

- **Backend**: FastAPI (Python 3.12) with async SQLAlchemy
- **Frontend**: Next.js 14 with React and TypeScript
- **Database**: PostgreSQL 16
- **Package Management**: uv (Python), npm (Node.js)
- **Development**: DevContainers with Docker Compose orchestration

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

## 🔧 Configuration

Backend configuration is managed through environment variables in `backend/.env`:

- `DATABASE_URL`: PostgreSQL connection string
- `ENVIRONMENT`: Current environment (development/production)
- `PROJECT_NAME`: API project name
- `API_V1_PREFIX`: API version prefix
- `CORS_ORIGINS`: Allowed CORS origins

## 📋 Current Status

- ✅ Phase 1: Project Setup & Infrastructure (Complete)
- ⏳ Phase 2: Frontend Design Selection (Pending)
- ⏳ Phase 3: Backend Implementation (Pending)
- ⏳ Phase 4: Frontend Implementation (Pending)
- ⏳ Phase 5: End-to-End Testing (Pending)
- ⏳ Phase 6: Documentation & Polish (Pending)

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
- **Playwright**: End-to-end testing framework

### Development Tools
- **Black**: Python code formatter
- **Flake8**: Python linter
- **ESLint**: JavaScript/TypeScript linter
- **Prettier**: Code formatter for JS/TS
- **Docker Compose**: Multi-container orchestration
- **DevContainers**: Consistent development environment

## 📖 License

MIT
