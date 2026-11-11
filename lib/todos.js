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

export function moveTodoUp(todos, id) {
  const index = todos.findIndex((t) => t.id === id);
  if (index <= 0) return todos;
  const nextTodos = [...todos];
  const temp = nextTodos[index];
  nextTodos[index] = nextTodos[index - 1];
  nextTodos[index - 1] = temp;
  return nextTodos;
}

export function moveTodoDown(todos, id) {
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1 || index >= todos.length - 1) return todos;
  const nextTodos = [...todos];
  const temp = nextTodos[index];
  nextTodos[index] = nextTodos[index + 1];
  nextTodos[index + 1] = temp;
  return nextTodos;
}

export function exportTodos(todos) {
  const list = todos.map((todo) => ({
    title: todo.title,
    done: !!todo.done,
  }));
  return JSON.stringify(list, null, 2);
}

export function validateImport(text) {
  try {
    const data = JSON.parse(text);
    if (!Array.isArray(data)) {
      return { valid: false, error: "This is not a list of todos" };
    }
    const parsedTodos = [];
    for (const item of data) {
      if (!item || typeof item !== "object") {
        return { valid: false, error: "This is not a list of todos" };
      }
      if (typeof item.title !== "string") {
        return { valid: false, error: "This is not a list of todos" };
      }
      const title = item.title.trim();
      if (title === "" || title.length > 100) {
        return { valid: false, error: "This is not a list of todos" };
      }
      if (item.done !== undefined && typeof item.done !== "boolean") {
        return { valid: false, error: "This is not a list of todos" };
      }
      parsedTodos.push({
        title,
        done: !!item.done,
      });
    }
    return { valid: true, todos: parsedTodos };
  } catch (e) {
    return { valid: false, error: "This is not a list of todos" };
  }
}
