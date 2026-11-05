import assert from "node:assert/strict";
import test from "node:test";

import { addTodo, MAX_TITLE, remaining, removeTodo, toggleTodo } from "../lib/todos.js";

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

test("exact differentiation between completed tasks and deleted tasks", () => {
  const initialTodos = [
    { id: 1, title: "Task 1", done: false },
    { id: 2, title: "Task 2", done: false }
  ];

  // 1. Mark Task 1 as completed (toggled)
  const completedTodos = toggleTodo(initialTodos, 1);
  
  // Completed tasks must remain in the list/state
  assert.equal(completedTodos.length, 2, "Completed task should remain in the list");
  assert.deepEqual(
    completedTodos.find((t) => t.id === 1),
    { id: 1, title: "Task 1", done: true },
    "Completed task should have its done state set to true"
  );
  
  // 2. Delete Task 2
  const deletedTodos = removeTodo(completedTodos, 2);
  
  // Deleted tasks must be completely purged from the application state
  assert.equal(deletedTodos.length, 1, "Deleted task should be removed from the list");
  assert.equal(deletedTodos.find((t) => t.id === 2), undefined, "Deleted task should not exist in the list");
  assert.deepEqual(
    deletedTodos,
    [{ id: 1, title: "Task 1", done: true }],
    "List should only contain the remaining tasks (even if completed)"
  );
});
