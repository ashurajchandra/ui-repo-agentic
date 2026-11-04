import assert from "node:assert/strict";
import test from "node:test";

import { addTodo, MAX_TITLE, remaining, removeTodo, toggleTodo, sortTodos, isOverdue } from "../lib/todos.js";

test("adds a todo with the next id and trims the title", () => {
  const todos = addTodo(addTodo([], "  Buy milk "), "Call Sam");
  assert.deepEqual(todos, [
    { id: 1, title: "Buy milk", done: false },
    { id: 2, title: "Call Sam", done: false }
  ]);
});

test("ignores an empty title and cuts a very long one", () => {
  assert.deepEqual(addTodo([], "   "), []);
  assert.equal(addTodo([], "x".repeat(500))[0].title.length, MAX_TITLE);
});

test("toggles and removes by id, and counts what is left", () => {
  const todos = addTodo(addTodo([], "a"), "b");
  const toggled = toggleTodo(todos, 1);
  assert.equal(remaining(toggled), 1);
  assert.deepEqual(removeTodo(toggled, 1).map((todo) => todo.id), [2]);
});

test("adds a todo with optional due date", () => {
  const todos = addTodo([], "Buy groceries", "2025-02-14");
  assert.deepEqual(todos, [
    { id: 1, title: "Buy groceries", done: false, dueDate: "2025-02-14" }
  ]);
});

test("sortTodos sorts open tasks by due date ascending with undated last, preserving completed ones at the end", () => {
  const todos = [
    { id: 1, title: "No date 1", done: false },
    { id: 2, title: "Late", done: false, dueDate: "2025-02-15" },
    { id: 3, title: "Early", done: false, dueDate: "2025-02-10" },
    { id: 4, title: "No date 2", done: false },
    { id: 5, title: "Completed with date", done: true, dueDate: "2025-01-01" },
    { id: 6, title: "Completed no date", done: true }
  ];

  const sorted = sortTodos(todos);

  // Expected order of open:
  // 1. Early (2025-02-10)
  // 2. Late (2025-02-15)
  // 3. No date 1
  // 4. No date 2
  // Then completed ones should be at the end:
  // 5. Completed with date
  // 6. Completed no date
  assert.deepEqual(sorted, [
    { id: 3, title: "Early", done: false, dueDate: "2025-02-10" },
    { id: 2, title: "Late", done: false, dueDate: "2025-02-15" },
    { id: 1, title: "No date 1", done: false },
    { id: 4, title: "No date 2", done: false },
    { id: 5, title: "Completed with date", done: true, dueDate: "2025-01-01" },
    { id: 6, title: "Completed no date", done: true }
  ]);
});

test("isOverdue correctly classifies overdue open todos given mock today date", () => {
  const today = "2025-02-14";

  // Overdue: due date before today and not completed
  assert.equal(isOverdue({ done: false, dueDate: "2025-02-13" }, today), true);
  
  // Not overdue: due date is today
  assert.equal(isOverdue({ done: false, dueDate: "2025-02-14" }, today), false);

  // Not overdue: due date is in the future
  assert.equal(isOverdue({ done: false, dueDate: "2025-02-15" }, today), false);

  // Not overdue: completed even if due date is in the past
  assert.equal(isOverdue({ done: true, dueDate: "2025-02-13" }, today), false);

  // Not overdue: no due date
  assert.equal(isOverdue({ done: false }, today), false);
});
