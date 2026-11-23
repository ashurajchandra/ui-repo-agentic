// The list's rules, in plain functions with no React in them, so they are easy to test and easy to reuse.

export const MAX_TITLE = 80;

export function addTodo(todos, title, dueDate) {
  const clean = String(title ?? "").trim().slice(0, MAX_TITLE);
  if (clean === "") return todos;
  const id = todos.reduce((highest, todo) => Math.max(highest, todo.id), 0) + 1;
  const newTodo = { id, title: clean, done: false };
  if (dueDate) {
    newTodo.dueDate = dueDate;
  }
  return [...todos, newTodo];
}

export function toggleTodo(todos, id) {
  return todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo));
}

export function removeTodo(todos, id) {
  return todos.filter((todo) => todo.id !== id);
}

export function updateDueDate(todos, id, dueDate) {
  return todos.map((todo) => {
    if (todo.id === id) {
      const updated = { ...todo };
      if (dueDate) {
        updated.dueDate = dueDate;
      } else {
        delete updated.dueDate;
      }
      return updated;
    }
    return todo;
  });
}

export function remaining(todos) {
  return todos.filter((todo) => !todo.done).length;
}
