// The list's rules, in plain functions with no React in them, so they are easy to test and easy to reuse.

export const MAX_TITLE = 80;

export function addTodo(todos, title) {
  const clean = String(title ?? "").trim().slice(0, MAX_TITLE);
  if (clean === "") return todos;
  const id = todos.reduce((highest, todo) => Math.max(highest, todo.id), 0) + 1;
  return [...todos, { id, title: clean, done: false }];
}

export function toggleTodo(todos, id) {
  return todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo));
}

export function removeTodo(todos, id) {
  return todos.filter((todo) => todo.id !== id);
}

export function remaining(todos) {
  return todos.filter((todo) => !todo.done).length;
}

export function editTodo(todos, id, newTitle) {
  const clean = String(newTitle ?? "").trim();
  if (clean === "") return todos;
  const truncated = clean.slice(0, MAX_TITLE);
  return todos.map((todo) => (todo.id === id ? { ...todo, title: truncated } : todo));
}

export function clearCompletedTodos(todos) {
  return todos.filter((todo) => !todo.done);
}
