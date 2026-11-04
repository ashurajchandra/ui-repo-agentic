// The list's rules, in plain functions with no React in them, so they are easy to test and easy to reuse.

export const MAX_TITLE = 80;

export function addTodo(todos, title, dueDate) {
  const clean = String(title ?? "").trim().slice(0, MAX_TITLE);
  if (clean === "") return todos;
  const id = todos.reduce((highest, todo) => Math.max(highest, todo.id), 0) + 1;
  const newTodo = { id, title: clean, done: false };
  if (typeof dueDate === "string" && dueDate.trim() !== "") {
    newTodo.dueDate = dueDate.trim();
  }
  return [...todos, newTodo];
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

export function sortTodos(todos) {
  const open = todos.filter((todo) => !todo.done);
  const completed = todos.filter((todo) => todo.done);

  open.sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      return a.dueDate.localeCompare(b.dueDate);
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });

  return [...open, ...completed];
}

export function isOverdue(todo, today) {
  if (todo.done || !todo.dueDate) return false;
  return todo.dueDate < today;
}
