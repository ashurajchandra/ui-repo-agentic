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

export function moveTodo(todos, id, direction) {
  const index = todos.findIndex((todo) => todo.id === id);
  if (index === -1) return todos;
  const newIndex = direction === "up" ? index - 1 : index + 1;
  if (newIndex < 0 || newIndex >= todos.length) return todos;
  const nextTodos = [...todos];
  const temp = nextTodos[index];
  nextTodos[index] = nextTodos[newIndex];
  nextTodos[newIndex] = temp;
  return nextTodos;
}

export function exportTodos(todos) {
  const formatted = todos.map(({ title, done }) => ({ title, done: !!done }));
  return JSON.stringify(formatted, null, 2);
}

export function validateImportJSON(text) {
  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) return null;
    const validated = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") return null;
      if (typeof item.title !== "string") return null;
      const titleTrimmed = item.title.trim();
      if (titleTrimmed === "" || item.title.length > 100) return null;
      if (item.done !== undefined && typeof item.done !== "boolean") return null;
      validated.push({
        title: titleTrimmed,
        done: !!item.done
      });
    }
    return validated;
  } catch {
    return null;
  }
}

export function importTodos(currentTodos, validatedImports) {
  const existingLowerTitles = new Set(currentTodos.map(t => t.title.toLowerCase()));
  let added = 0;
  let skipped = 0;
  let highestId = currentTodos.reduce((highest, todo) => Math.max(highest, todo.id), 0);
  const nextTodos = [...currentTodos];

  for (const item of validatedImports) {
    if (existingLowerTitles.has(item.title.toLowerCase())) {
      skipped++;
    } else {
      highestId++;
      nextTodos.push({
        id: highestId,
        title: item.title,
        done: item.done
      });
      existingLowerTitles.add(item.title.toLowerCase());
      added++;
    }
  }
  return { todos: nextTodos, added, skipped };
}
