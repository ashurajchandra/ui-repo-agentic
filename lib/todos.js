// The list's rules, in plain functions with no React in them, so they are easy to test and easy to reuse.

export const MAX_TITLE = 80;

const PRIORITY_RANK = {
  High: 1,
  Medium: 2,
  Low: 3
};

function getPriority(todo) {
  return todo.priority || "Medium";
}

export function sortTodos(todos) {
  return [...todos].sort((a, b) => {
    // 1. Open todos first, completed todos last
    if (!!a.done !== !!b.done) {
      return a.done ? 1 : -1;
    }
    // 2. Sort by priority rank
    const rankA = PRIORITY_RANK[getPriority(a)] || 2;
    const rankB = PRIORITY_RANK[getPriority(b)] || 2;
    if (rankA !== rankB) {
      return rankA - rankB;
    }
    // 3. Keep creation order (id)
    return a.id - b.id;
  });
}

export function addTodo(todos, title, priority = "Medium") {
  const clean = String(title ?? "").trim().slice(0, MAX_TITLE);
  if (clean === "") return todos;
  const id = todos.reduce((highest, todo) => Math.max(highest, todo.id), 0) + 1;
  const newTodo = { id, title: clean, done: false, priority };
  return sortTodos([...todos, newTodo]);
}

export function toggleTodo(todos, id) {
  const updated = todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo));
  return sortTodos(updated);
}

export function removeTodo(todos, id) {
  const updated = todos.filter((todo) => todo.id !== id);
  return sortTodos(updated);
}

export function updateTodoPriority(todos, id, priority) {
  const updated = todos.map((todo) => (todo.id === id ? { ...todo, priority } : todo));
  return sortTodos(updated);
}

export function remaining(todos) {
  return todos.filter((todo) => !todo.done).length;
}
