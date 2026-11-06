// The list's rules, in plain functions with no React in them, so they are easy to test and easy to reuse.

export const MAX_TITLE = 80;

export function addTodo(todos, title, dueDate = "") {
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

export function filterTodos(todos, filter) {
  const cleanFilter = String(filter ?? "").toLowerCase();
  if (cleanFilter === "active") {
    return todos.filter((todo) => !todo.done);
  }
  if (cleanFilter === "completed") {
    return todos.filter((todo) => todo.done);
  }
  return todos;
}

export function getCounts(todos) {
  return {
    all: todos.length,
    active: todos.filter((todo) => !todo.done).length,
    completed: todos.filter((todo) => todo.done).length,
  };
}

export function recoverTodos(rawText) {
  if (!rawText) return [];
  try {
    const parsed = JSON.parse(rawText);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (e) {
    return [];
  }
}

export function isOverdue(dueDate, done, today = new Date()) {
  if (done) return false;
  if (!dueDate) return false;
  const parts = dueDate.split("-");
  if (parts.length !== 3) return false;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const d = new Date(year, month, day);
  d.setHours(0, 0, 0, 0);

  const t = new Date(today);
  t.setHours(0, 0, 0, 0);

  return d < t;
}

export function getDueText(dueDate, done, today = new Date()) {
  if (!dueDate) return "";
  const parts = dueDate.split("-");
  if (parts.length !== 3) return "";
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mStr = months[month] || "";

  if (!done && isOverdue(dueDate, done, today)) {
    return `Overdue · ${day} ${mStr}`;
  }
  return `Due ${day} ${mStr}`;
}
