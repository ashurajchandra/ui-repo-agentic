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

export const DEFAULT_SETTINGS = {
  showCompleted: true,
  sortBy: "Newest first"
};

export function validateSettings(settings) {
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    return DEFAULT_SETTINGS;
  }
  const validated = { ...DEFAULT_SETTINGS };
  if (typeof settings.showCompleted === "boolean") {
    validated.showCompleted = settings.showCompleted;
  }
  if (settings.sortBy === "Newest first" || settings.sortBy === "Title A–Z") {
    validated.sortBy = settings.sortBy;
  }
  return validated;
}

export function validateTodos(parsed) {
  if (!Array.isArray(parsed)) {
    return [];
  }
  return parsed.filter(t => t && typeof t === "object" && typeof t.id === "number" && typeof t.title === "string");
}

export function filterAndSortTodos(todos, settings) {
  const validSettings = validateSettings(settings);
  let result = [...todos];
  if (!validSettings.showCompleted) {
    result = result.filter(todo => !todo.done);
  }
  if (validSettings.sortBy === "Title A–Z") {
    result.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    // Newest first
    result.sort((a, b) => b.id - a.id);
  }
  return result;
}
