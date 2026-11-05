// The list's rules, in plain functions with no React in them, so they are easy to test and easy to reuse.

export const MAX_TITLE = 80;

/**
 * Adds a new todo to the list.
 * 
 * @param {Array} todos - The current list of todo items.
 * @param {string} title - The title of the new todo.
 * @returns {Array} The new array of todo items.
 */
export function addTodo(todos, title) {
  const clean = String(title ?? "").trim().slice(0, MAX_TITLE);
  if (clean === "") return todos;
  const id = todos.reduce((highest, todo) => Math.max(highest, todo.id), 0) + 1;
  return [...todos, { id, title: clean, done: false }];
}

/**
 * Toggles the completed status (done state) of a todo item.
 * When marked as completed (done: true), the task remains in the list so that
 * it can be visually rendered with a CSS line-through style.
 * 
 * @param {Array} todos - The current list of todo items.
 * @param {number} id - The unique ID of the todo to toggle.
 * @returns {Array} A new array of todo items with the target todo toggled.
 */
export function toggleTodo(todos, id) {
  return todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo));
}

/**
 * Completely purges a task from the application state.
 * When deleted, the task is entirely removed from the list so that it
 * no longer appears anywhere in the active list view.
 * 
 * @param {Array} todos - The current list of todo items.
 * @param {number} id - The unique ID of the todo to delete.
 * @returns {Array} A new array with the target todo completely purged.
 */
export function removeTodo(todos, id) {
  return todos.filter((todo) => todo.id !== id);
}

/**
 * Returns the count of remaining active (not completed) todo items.
 * 
 * @param {Array} todos - The list of todo items.
 * @returns {number} The count of items where done is false.
 */
export function remaining(todos) {
  return todos.filter((todo) => !todo.done).length;
}
