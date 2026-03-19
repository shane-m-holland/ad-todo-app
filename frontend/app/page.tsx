import { TodoForm } from "@/components/TodoForm";
import { TodoList } from "@/components/TodoList";

/**
 * Home page component displaying the todo application.
 * Combines the TodoForm for creating new todos and TodoList for displaying existing todos.
 */
export default function Home() {
  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Todo App</h1>
          <p className="text-gray-600">
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
