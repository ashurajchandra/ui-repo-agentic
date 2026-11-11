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

export function exportTodos(todos) {
  const list = todos.map((todo) => ({
    title: todo.title,
    done: !!todo.done,
  }));
  return JSON.stringify(list, null, 2);
}

export function validateTodosJSON(text) {
  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) {
      return { valid: false, error: "This is not a list of todos" };
    }
    for (const item of parsed) {
      if (!item || typeof item !== "object") {
        return { valid: false, error: "This is not a list of todos" };
      }
      if (typeof item.title !== "string" || item.title.trim() === "" || item.title.length > 100) {
        return { valid: false, error: "This is not a list of todos" };
      }
      if (item.done !== undefined && typeof item.done !== "boolean") {
        return { valid: false, error: "This is not a list of todos" };
      }
    }
    return { valid: true, todos: parsed };
  } catch (e) {
    return { valid: false, error: "This is not a list of todos" };
  }
}

export function addImportedTodos(todos, importedTodos) {
  let addedCount = 0;
  let skippedCount = 0;
  let currentTodos = [...todos];

  for (const imported of importedTodos) {
    const cleanTitle = String(imported.title ?? "").trim();
    const exists = currentTodos.some((t) => t.title.toLowerCase() === cleanTitle.toLowerCase());
    if (exists) {
      skippedCount++;
    } else {
      const id = currentTodos.reduce((highest, todo) => Math.max(highest, todo.id), 0) + 1;
      currentTodos.push({
        id,
        title: cleanTitle,
        done: !!imported.done,
      });
      addedCount++;
    }
  }

  return {
    todos: currentTodos,
    addedCount,
    skippedCount,
    message: `Added ${addedCount}, skipped ${skippedCount} already in your list`,
  };
}

export function moveTodo(todos, id, direction) {
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) return todos;
  const nextTodos = [...todos];
  if (direction === "up" && index > 0) {
    const temp = nextTodos[index];
    nextTodos[index] = nextTodos[index - 1];
    nextTodos[index - 1] = temp;
  } else if (direction === "down" && index < nextTodos.length - 1) {
    const temp = nextTodos[index];
    nextTodos[index] = nextTodos[index + 1];
    nextTodos[index + 1] = temp;
  }
  return nextTodos;
}
