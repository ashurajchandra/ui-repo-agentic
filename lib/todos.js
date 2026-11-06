// The list's rules, in plain functions with no React in them, so they are easy to test and easy to reuse.

export const MAX_TITLE = 80;

export function sortTodos(todos) {
  const openTodos = todos.filter(t => !t.done);
  const doneTodos = todos.filter(t => t.done);

  const priorityWeight = {
    'High': 3,
    'Medium': 2,
    'Low': 1
  };

  const getPriority = (todo) => {
    const p = todo.priority;
    if (p === 'High' || p === 'Medium' || p === 'Low') {
      return p;
    }
    return 'Medium';
  };

  openTodos.sort((a, b) => {
    const pA = priorityWeight[getPriority(a)];
    const pB = priorityWeight[getPriority(b)];
    if (pA !== pB) {
      return pB - pA; // High (3) before Medium (2) before Low (1)
    }
    return a.id - b.id; // order of creation
  });

  doneTodos.sort((a, b) => a.id - b.id);

  return [...openTodos, ...doneTodos];
}

export function addTodo(todos, title, priority) {
  const clean = String(title ?? "").trim().slice(0, MAX_TITLE);
  if (clean === "") return todos;
  const id = todos.reduce((highest, todo) => Math.max(highest, todo.id), 0) + 1;
  const newTodo = { id, title: clean, done: false };
  if (priority !== undefined) {
    const validPriority = (priority === "High" || priority === "Medium" || priority === "Low") ? priority : "Medium";
    newTodo.priority = validPriority;
  }
  return sortTodos([...todos, newTodo]);
}

export function toggleTodo(todos, id) {
  const updated = todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo));
  return sortTodos(updated);
}

export function updateTodoPriority(todos, id, priority) {
  const validPriority = (priority === "High" || priority === "Medium" || priority === "Low") ? priority : "Medium";
  const updated = todos.map((todo) => (todo.id === id ? { ...todo, priority: validPriority } : todo));
  return sortTodos(updated);
}

export function removeTodo(todos, id) {
  return todos.filter((todo) => todo.id !== id);
}

export function remaining(todos) {
  return todos.filter((todo) => !todo.done).length;
}
