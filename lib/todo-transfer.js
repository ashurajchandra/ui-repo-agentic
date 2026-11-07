export function exportTodos(todos) {
  if (!Array.isArray(todos)) return [];
  return todos.map(({ title, done }) => ({
    title: String(title || ""),
    done: !!done
  }));
}

export function parseAndValidateImport(text) {
  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) {
      return { valid: false, error: "This is not a list of todos" };
    }
    const validated = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") {
        return { valid: false, error: "This is not a list of todos" };
      }
      if (typeof item.title !== "string") {
        return { valid: false, error: "This is not a list of todos" };
      }
      const trimmedTitle = item.title.trim();
      if (trimmedTitle.length === 0 || item.title.length > 100) {
        return { valid: false, error: "This is not a list of todos" };
      }
      if (item.done !== undefined && typeof item.done !== "boolean") {
        return { valid: false, error: "This is not a list of todos" };
      }
      validated.push({
        title: trimmedTitle,
        done: !!item.done
      });
    }
    return { valid: true, todos: validated };
  } catch (err) {
    return { valid: false, error: "This is not a list of todos" };
  }
}

export function importTodos(existing, imported) {
  const currentTodos = [...existing];
  let added = 0;
  let skipped = 0;
  
  let nextId = currentTodos.reduce((highest, todo) => Math.max(highest, todo.id), 0) + 1;
  
  for (const item of imported) {
    const match = currentTodos.some(
      (t) => t.title.toLowerCase() === item.title.toLowerCase()
    );
    if (match) {
      skipped++;
    } else {
      currentTodos.push({
        id: nextId,
        title: item.title,
        done: !!item.done
      });
      nextId++;
      added++;
    }
  }
  
  return { todos: currentTodos, added, skipped };
}
