# Todo App Frontend

A modern, responsive TODO application built with Next.js 14, React, TypeScript, and Tailwind CSS.

## 🚀 Features

- ✅ **Create, Read, Update, Delete** todos
- ✅ **Mark todos as complete/incomplete**
- ✅ **Edit existing todos** with double-click or edit button
- ✅ **Real-time updates** with React Query
- ✅ **Smooth animations** using Framer Motion
- ✅ **Responsive design** with Tailwind CSS
- ✅ **Comprehensive testing** (91.91% coverage with Jest & React Testing Library)
- ✅ **E2E testing** with Playwright
- ✅ **Type-safe** with TypeScript

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form
- **Animations**: Framer Motion
- **Testing**: Jest, React Testing Library, Playwright
- **Type Checking**: TypeScript

## 📁 Project Structure

```
frontend/
├── app/                      # Next.js app directory
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── providers.tsx        # React Query provider
├── components/              # React components
│   ├── TodoForm.tsx         # Todo creation form
│   ├── TodoItem.tsx         # Individual todo item
│   └── TodoList.tsx         # Todo list container
├── services/                # API and data layer
│   ├── api.ts              # API client functions
│   └── queries.ts          # React Query hooks
├── types/                   # TypeScript type definitions
│   └── todo.ts             # Todo interfaces
├── __tests__/              # Unit tests
│   ├── app/
│   ├── components/
│   └── services/
├── e2e/                    # End-to-end tests
│   ├── happy-paths.spec.ts
│   └── error-scenarios.spec.ts
└── public/                 # Static assets
```

## 🚦 Getting Started

### Prerequisites

- Node.js 20+ (included in Docker)
- Docker and Docker Compose

### Installation

1. **Build and run with Docker Compose** (from project root):

   ```bash
   docker compose up frontend
   ```

2. **Access the application**:
   ```
   http://localhost:3000
   ```

### Development

The frontend runs in development mode with hot-reloading enabled. Any changes to the code will automatically refresh the browser.

## 🧪 Testing

### Unit Tests

Run unit tests with coverage:

```bash
docker compose run --rm frontend npm run test:coverage
```

Run tests in watch mode:

```bash
docker compose run --rm frontend npm run test:watch
```

### Current Test Coverage

- **Statements**: 91.91%
- **Branches**: 90.74%
- **Functions**: 95.12%
- **Lines**: 93.12%

### E2E Tests

Run Playwright tests:

```bash
docker compose run --rm frontend npm run test:e2e
```

Run Playwright with UI:

```bash
docker compose run --rm frontend npm run test:e2e:ui
```

## 📝 API Integration

The frontend communicates with the FastAPI backend through a REST API:

### Endpoints Used

- `GET /api/v1/todos` - Fetch all todos
- `GET /api/v1/todos/{id}` - Fetch a single todo
- `POST /api/v1/todos` - Create a new todo
- `PUT /api/v1/todos/{id}` - Update a todo
- `DELETE /api/v1/todos/{id}` - Delete a todo

### Configuration

The API URL is configured via environment variable:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🎨 UI/UX Features

### Animations

- Smooth fade-in for new todos
- Slide animations for list updates
- Transition effects on hover and interactions

### Design

- Clean, minimalist card-based layout
- Blue accent color scheme
- Responsive design for all screen sizes
- Visual feedback for user actions

### User Interactions

- **Add Todo**: Type in the input field and click "Add Todo"
- **Complete Todo**: Check the checkbox next to a todo
- **Edit Todo**:
  - Double-click on a todo title, OR
  - Click the "Edit" button
  - Press Enter to save, Escape to cancel
- **Delete Todo**: Click the "Delete" button

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run E2E tests
- `npm run test:e2e:ui` - Run E2E tests with Playwright UI

## 📦 Key Dependencies

### Production

- `next` (14.1.4) - React framework
- `react` (18.2.0) - UI library
- `@tanstack/react-query` (5.28.4) - Server state management
- `framer-motion` (11.0.8) - Animations
- `react-hook-form` (7.51.1) - Form handling
- `tailwindcss` (3.4.1) - Utility-first CSS

### Development

- `@playwright/test` (1.42.1) - E2E testing
- `jest` (29.7.0) - Unit testing
- `@testing-library/react` (14.2.1) - React testing utilities
- `typescript` (5.4.2) - Type checking

## 🏗️ Architecture

### Component Hierarchy

```
App
└── Providers (React Query)
    └── Page
        ├── TodoForm
        └── TodoList
            └── TodoItem (multiple)
```

### Data Flow

1. **User Action** → Component
2. **Component** → React Hook Form (validation)
3. **Form** → React Query Mutation
4. **Mutation** → API Call
5. **API Response** → React Query Cache Update
6. **Cache Update** → Component Re-render

### State Management Strategy

- **Server State**: Managed by React Query
  - Automatic caching
  - Background refetching
  - Optimistic updates
- **Local State**: Managed by React hooks
  - Form inputs
  - UI state (editing mode, etc.)

## 🔍 Code Quality

### Type Safety

All components and functions are fully typed with TypeScript, providing:

- Compile-time error checking
- Better IDE autocomplete
- Self-documenting code

### Testing Strategy

- **Unit Tests**: Components and services tested in isolation
- **Integration Tests**: API integration tested with mocked backend
- **E2E Tests**: Full user flows tested in a real browser

### Documentation

- Comprehensive JSDoc comments for all functions and components
- Inline comments for complex logic
- Type definitions serve as documentation

## 🚀 Performance Optimizations

- Server-side rendering with Next.js
- Automatic code splitting
- React Query caching reduces unnecessary API calls
- Lazy loading of routes
- Optimized bundle size

## 🔒 Error Handling

- API errors displayed to users with clear messages
- Form validation with real-time feedback
- Loading states for async operations
- Retry logic for failed requests

## 📱 Responsive Design

The application is fully responsive and works on:

- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🎯 Future Enhancements

Potential features for future development:

- Dark mode support
- Todo categories/tags
- Due dates and reminders
- Drag-and-drop reordering
- Bulk actions
- Search and filter
- User authentication
- Offline support with PWA

## 📄 License

This project is part of a fullstack todo application demo.

## 🤝 Contributing

1. Follow the existing code style
2. Write tests for new features
3. Ensure all tests pass
4. Update documentation as needed

---

Built with ❤️ using Next.js and React
