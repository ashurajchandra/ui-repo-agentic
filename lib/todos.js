// The list's rules, in plain functions with no React in them, so they are easy to test and easy to reuse.

export const MAX_TITLE = 80;

export function addTodo(todos, title, dueDate) {
  const clean = String(title ?? "").trim().slice(0, MAX_TITLE);
  if (clean === "") return todos;
  const id = todos.reduce((highest, todo) => Math.max(highest, todo.id), 0) + 1;
  const newTodo = { id, title: clean, done: false };
  if (dueDate) {
    newTodo.dueDate = dueDate;
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

export function isOverdue(todo, currentDate) {
  if (!todo || todo.done || !todo.dueDate) return false;
  const today = new Date(currentDate || Date.now());
  today.setHours(0, 0, 0, 0);
  const due = new Date(todo.dueDate);
  due.setHours(0, 0, 0, 0);
  return due.getTime() < today.getTime();
}

export function sortOpenTodos(todos) {
  const openTodos = todos.filter((t) => !t.done);
  const completedTodos = todos.filter((t) => t.done);

  openTodos.sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });

  return [...openTodos, ...completedTodos];
}
