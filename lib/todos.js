// The list's rules, in plain functions with no React in them, so they are easy to test and easy to reuse.

export const MAX_TITLE = 80;

export function addTodo(todos, title) {
  const clean = String(title ?? "").trim().slice(0, MAX_TITLE);
  if (clean === "") return todos;
  const id = todos.reduce((highest, todo) => Math.max(highest, todo.id), 0) + 1;
  return [...todos, { id, title: clean, done: false, tags: [] }];
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

export function addTag(todos, id, tag) {
  const clean = String(tag ?? "").trim().toLowerCase();
  if (clean === "" || clean.length > 20) return todos;
  return todos.map((todo) => {
    if (todo.id === id) {
      const currentTags = todo.tags || [];
      if (currentTags.includes(clean)) return todo;
      return { ...todo, tags: [...currentTags, clean] };
    }
    return todo;
  });
}

export function removeTag(todos, id, tagToRemove) {
  const clean = String(tagToRemove ?? "").trim().toLowerCase();
  return todos.map((todo) => {
    if (todo.id === id) {
      const currentTags = todo.tags || [];
      return { ...todo, tags: currentTags.filter((t) => t !== clean) };
    }
    return todo;
  });
}

export function validateAndMigrateTodos(parsed) {
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((t) => t && typeof t === "object" && typeof t.id === "number" && typeof t.title === "string")
    .map((t) => {
      let tags = [];
      if (Array.isArray(t.tags)) {
        tags = t.tags
          .filter((tag) => typeof tag === "string")
          .map((tag) => tag.trim().toLowerCase())
          .filter((tag) => tag.length > 0 && tag.length <= 20);
        tags = [...new Set(tags)];
      }
      return {
        id: t.id,
        title: t.title,
        done: !!t.done,
        tags: tags,
      };
    });
}
