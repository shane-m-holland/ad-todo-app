import { ThemeToggle } from "@/components/ThemeToggle";
import { TodoForm } from "@/components/TodoForm";
import { TodoList } from "@/components/TodoList";

/**
 * Home page component displaying the todo application.
 * Combines the TodoForm for creating new todos and TodoList for displaying existing todos.
 */
export default function Home() {
  return (
    <main className="min-h-screen py-12 px-4 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12 relative">
          <div className="absolute right-0 top-0">
            <ThemeToggle />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Todo App
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            A simple and elegant way to manage your tasks
          </p>
        </header>

        {/* Todo Form */}
        <TodoForm />

        {/* Todo List */}
        <TodoList />
      </div>
    </main>
  );
}
