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

export function swapTodos(todos, fromIndex, toIndex) {
  if (!Array.isArray(todos)) {
    return [];
  }
  if (
    typeof fromIndex !== "number" ||
    typeof toIndex !== "number" ||
    fromIndex < 0 ||
    fromIndex >= todos.length ||
    toIndex < 0 ||
    toIndex >= todos.length
  ) {
    return todos;
  }
  if (fromIndex === toIndex) {
    return todos;
  }
  const result = [...todos];
  const temp = result[fromIndex];
  result[fromIndex] = result[toIndex];
  result[toIndex] = temp;
  return result;
}
