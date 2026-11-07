// The list's rules, in plain functions with no React in them, so they are easy to test and easy to reuse.
import { reorder } from "./reorder.js";

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

export function sanitizeSavedTodos(parsed) {
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((t) => t && typeof t === "object" && typeof t.id === "number" && typeof t.title === "string")
    .map((t) => ({ id: t.id, title: t.title, done: !!t.done }));
}

export function validateImportJSON(text) {
  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) {
      return null;
    }
    for (const item of parsed) {
      if (!item || typeof item !== "object") return null;
      if (typeof item.title !== "string" || item.title.trim() === "" || item.title.length > 100) {
        return null;
      }
      if (item.hasOwnProperty("done") && typeof item.done !== "boolean") {
        return null;
      }
    }
    return parsed.map((item) => ({
      title: item.title.trim(),
      done: !!item.done,
    }));
  } catch (e) {
    return null;
  }
}

export function importTodos(currentTodos, importedItems) {
  const currentTitles = new Set(currentTodos.map((t) => t.title.toLowerCase()));
  let added = 0;
  let skipped = 0;
  let updatedTodos = [...currentTodos];

  for (const item of importedItems) {
    const titleLower = item.title.trim().toLowerCase();
    if (currentTitles.has(titleLower)) {
      skipped++;
    } else {
      const id = updatedTodos.reduce((highest, todo) => Math.max(highest, todo.id), 0) + 1;
      updatedTodos.push({
        id,
        title: item.title.trim(),
        done: !!item.done,
      });
      currentTitles.add(titleLower);
      added++;
    }
  }
  return { todos: updatedTodos, added, skipped };
}

export function moveTodo(todos, id, direction) {
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) return todos;
  if (direction === "up") {
    if (index === 0) return todos;
    return reorder(todos, index, index - 1);
  } else if (direction === "down") {
    if (index === todos.length - 1) return todos;
    return reorder(todos, index, index + 1);
  }
  return todos;
}
