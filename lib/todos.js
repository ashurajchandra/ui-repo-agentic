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

export function validateSettings(settings) {
  if (!settings || typeof settings !== "object") return null;
  const showCompleted = typeof settings.showCompleted === "boolean" ? settings.showCompleted : true;
  const sortBy = (settings.sortBy === "newest" || settings.sortBy === "alphabetical") ? settings.sortBy : "newest";
  return { showCompleted, sortBy };
}

export function parseSettings(text) {
  try {
    const parsed = JSON.parse(text);
    const valid = validateSettings(parsed);
    if (valid) return valid;
  } catch (e) {
    // ignore
  }
  return { showCompleted: true, sortBy: "newest" };
}

export function sortAndFilterTodos(todos, settings) {
  const s = validateSettings(settings) || { showCompleted: true, sortBy: "newest" };
  let result = todos;
  if (!s.showCompleted) {
    result = result.filter((todo) => !todo.done);
  }
  if (s.sortBy === "newest") {
    return [...result].sort((a, b) => b.id - a.id);
  } else if (s.sortBy === "alphabetical") {
    return [...result].sort((a, b) => a.title.localeCompare(b.title));
  }
  return result;
}
