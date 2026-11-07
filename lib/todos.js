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
  if (direction === "up") {
    if (index === 0) return todos;
    const result = [...todos];
    const [item] = result.splice(index, 1);
    result.splice(index - 1, 0, item);
    return result;
  }
  if (direction === "down") {
    if (index === todos.length - 1) return todos;
    const result = [...todos];
    const [item] = result.splice(index, 1);
    result.splice(index + 1, 0, item);
    return result;
  }
  return todos;
}
