# Plan: Full-Stack TODO App with FastAPI, Next.js, and PostgreSQL

**TL;DR**: Build a basic CRUD TODO application with Python FastAPI backend, React Next.js frontend, and PostgreSQL database. Start by creating 2-3 UI mockup options, select one, then implement the full stack with devcontainers, comprehensive testing (90%+ coverage), and complete documentation.

## Steps

### Phase 1: Project Setup & Infrastructure
1. Initialize project structure with separate backend and frontend directories
2. Create docker-compose.yml to orchestrate PostgreSQL, backend, and frontend services (*parallel with step 3*)
3. Configure devcontainer with all development tooling (Python, Node.js, PostgreSQL client, linters, formatters) (*parallel with step 2*)
4. Set up PostgreSQL database configuration and connection settings (*depends on step 2*)

### Phase 2: Frontend Design Selection
5. Create 2-3 UI mockup/wireframe options for the TODO interface (simple sketches or Figma/Excalidraw)
6. Review and select one design to implement (*depends on step 5*)

### Phase 3: Backend Implementation
7. Initialize FastAPI project structure with proper organization (routers, models, schemas, services)
8. Set up SQLAlchemy models for TODO entity (id, title, completed, created_at, updated_at) (*parallel with step 9*)
9. Configure Alembic for database migrations (*parallel with step 8*)
10. Run initial migration to create database schema (*depends on steps 8-9*)
11. Implement RESTful API endpoints at /api/v1/todos (GET, POST, PUT, DELETE) with Pydantic schemas (*depends on step 10*)
12. Add comprehensive docstrings to all backend functions and classes (*during step 11*)
13. Write backend unit tests (pytest) targeting 90%+ coverage (*depends on step 11*)
14. Generate and verify backend test coverage report (*depends on step 13*)

### Phase 4: Frontend Implementation
15. Initialize Next.js project with TypeScript and React (*parallel with step 16*)
16. Set up component library or base styling based on selected design (*parallel with step 15*)
17. Create TODO components (TodoList, TodoItem, TodoForm) following selected design (*depends on steps 15-16*)
18. Implement API client service to communicate with FastAPI backend (*parallel with step 17*)
19. Add comprehensive JSDoc comments to all components and functions (*during step 17-18*)
20. Wire up components with API calls for CRUD operations (*depends on steps 17-18*)
21. Write frontend unit tests (Jest/React Testing Library) targeting 90%+ coverage (*depends on step 20*)
22. Generate and verify frontend test coverage report (*depends on step 21*)

### Phase 5: End-to-End Testing
23. Set up Playwright test configuration (*parallel with step 24*)
24. Create Playwright test suite covering happy paths and error scenarios (*parallel with step 23*)
    - Happy paths: create todo, mark as complete, edit todo, delete todo, view list
    - Error scenarios: empty title validation, network errors, database connection issues
25. Run full Playwright test suite and verify all scenarios pass (*depends on step 24*)

### Phase 6: Documentation & Polish
26. Create comprehensive README.md with setup instructions, architecture overview, API documentation
27. Add inline code comments where logic is complex or non-obvious (*review all files*)
28. Create CONTRIBUTING.md with development workflow and testing guidelines (*parallel with step 26*)

## Relevant Files to Create

### Backend
- `backend/app/main.py` — FastAPI application entry point
- `backend/app/api/v1/endpoints/todos.py` — TODO CRUD endpoints
- `backend/app/models/todo.py` — SQLAlchemy TODO model
- `backend/app/schemas/todo.py` — Pydantic request/response schemas
- `backend/app/db/base.py` — Database session and connection
- `backend/app/core/config.py` — Application configuration
- `backend/alembic/` — Database migration files
- `backend/tests/` — Pytest unit tests
- `backend/requirements.txt` — Python dependencies
- `backend/Dockerfile` — Backend container configuration

### Frontend
- `frontend/pages/index.tsx` — Main TODO page
- `frontend/components/TodoList.tsx` — TODO list component
- `frontend/components/TodoItem.tsx` — Individual TODO item
- `frontend/components/TodoForm.tsx` — Form for creating/editing TODOs
- `frontend/services/api.ts` — API client service
- `frontend/tests/` — Jest/React Testing Library tests
- `frontend/package.json` — Node dependencies
- `frontend/Dockerfile` — Frontend container configuration
- `frontend/playwright.config.ts` — Playwright configuration
- `frontend/e2e/` — Playwright test files

### Infrastructure
- `.devcontainer/devcontainer.json` — Dev container configuration
- `.devcontainer/Dockerfile` — Custom dev container image
- `docker-compose.yml` — Service orchestration
- `docker-compose.dev.yml` — Development-specific overrides
- `README.md` — Project documentation
- `CONTRIBUTING.md` — Development guidelines

## Verification

1. Run `docker-compose up` and verify all services start successfully (PostgreSQL, backend, frontend)
2. Open devcontainer and verify all tools are available (python, node, psql, pytest, npm)
3. Run `pytest --cov=app --cov-report=html` in backend/ and verify 90%+ coverage
4. Run `npm run test:coverage` in frontend/ and verify 90%+ coverage
5. Run `npx playwright test` and verify all happy path and error scenario tests pass
6. Manually test the application: create, read, update, delete TODOs via the UI
7. Check that API returns proper versioned responses at /api/v1/todos
8. Review docstrings and JSDoc comments for completeness
9. Verify database migrations work: run `alembic upgrade head` and `alembic downgrade -1`
10. Test devcontainer rebuild from scratch to ensure reproducible environment

## Decisions

- **Database Schema**: Single `todos` table with fields: id (UUID/int primary key), title (string, required), completed (boolean, default false), created_at (timestamp), updated_at (timestamp)
- **API Structure**: RESTful with versioning `/api/v1/todos`, following standard HTTP methods (GET list, GET by id, POST create, PUT/PATCH update, DELETE remove)
- **ORM**: SQLAlchemy 2.0+ with async support for scalability
- **Frontend Framework**: Next.js 14+ with App Router for modern React patterns
- **Testing Libraries**: Backend (pytest + pytest-cov + pytest-asyncio), Frontend (Jest + React Testing Library), E2E (Playwright)
- **Code Quality**: ESLint + Prettier for frontend, Black + Flake8 for backend (configured in devcontainer)
- **Scope Inclusion**: Basic CRUD, proper error handling, loading states, form validation
- **Scope Exclusion**: Authentication, multi-user support, attachments, subtasks, recurring todos, advanced filtering (can be added later)

## Further Considerations

1. **UI Design Tool**: Do you want to use a specific tool for the 2-3 mockup options?
   - Option A: Hand-drawn sketches (fastest)
   - Option B: Excalidraw/Figma (professional-looking)
   - Option C: Code-based prototypes with different component libraries (MUI vs shadcn/ui vs Tailwind components)

2. **Backend Async vs Sync**: Should we use async FastAPI endpoints with async SQLAlchemy?
   - Option A: Async (better scalability, modern best practice)
   - Option B: Sync (simpler, fine for single-tenant app)
   - Recommendation: **Async** for future-proofing

3. **Database ID Type**: What type of primary key for TODOs?
   - Option A: Auto-incrementing integer (simple, sequential)
   - Option B: UUID (better for distributed systems, no enumeration)
   - Recommendation: **UUID** for security (no guessable IDs)

## Next Steps

Please review the plan and provide your preferences for the "Further Considerations" section above. Once approved, we can start implementing step by step!
