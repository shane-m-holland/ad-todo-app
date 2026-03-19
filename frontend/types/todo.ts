/**
 * Todo item interface matching the backend schema.
 */
export interface Todo {
  /** Unique identifier for the todo */
  id: string;
  /** Title/description of the todo item */
  title: string;
  /** Completion status of the todo */
  completed: boolean;
  /** ISO timestamp of when the todo was created */
  created_at: string;
  /** ISO timestamp of when the todo was last updated */
  updated_at: string;
}

/**
 * Data required to create a new todo item.
 */
export interface TodoCreate {
  /** Title/description of the todo item */
  title: string;
  /** Optional initial completion status, defaults to false */
  completed?: boolean;
}

/**
 * Data allowed for updating an existing todo item.
 */
export interface TodoUpdate {
  /** Optional new title for the todo */
  title?: string;
  /** Optional new completion status */
  completed?: boolean;
}
