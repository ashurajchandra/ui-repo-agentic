import assert from "node:assert/strict";
import test from "node:test";

import {
  addTodo,
  MAX_TITLE,
  remaining,
  removeTodo,
  toggleTodo,
  moveTodo,
  exportTodos,
  validateImportJSON,
  importTodos
} from "../lib/todos.js";

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

test("moves a todo up and down correctly", () => {
  const initial = [
    { id: 1, title: "A", done: false },
    { id: 2, title: "B", done: false },
    { id: 3, title: "C", done: false }
  ];
  
  // Move B up -> [B, A, C]
  const up = moveTodo(initial, 2, "up");
  assert.deepEqual(up, [
    { id: 2, title: "B", done: false },
    { id: 1, title: "A", done: false },
    { id: 3, title: "C", done: false }
  ]);

  // Move A down -> [B, C, A] (from up, A has id 1, index 1)
  const down = moveTodo(up, 1, "down");
  assert.deepEqual(down, [
    { id: 2, title: "B", done: false },
    { id: 3, title: "C", done: false },
    { id: 1, title: "A", done: false }
  ]);

  // Move first element up -> no change
  assert.deepEqual(moveTodo(initial, 1, "up"), initial);

  // Move last element down -> no change
  assert.deepEqual(moveTodo(initial, 3, "down"), initial);
});

test("exports todos to clean JSON format", () => {
  const todos = [
    { id: 1, title: "A", done: true, extra: "field" },
    { id: 2, title: "B", done: false }
  ];
  const exported = exportTodos(todos);
  const parsed = JSON.parse(exported);
  assert.deepEqual(parsed, [
    { title: "A", done: true },
    { title: "B", done: false }
  ]);
});

test("validates import JSON correctly", () => {
  // Valid JSON
  const valid = JSON.stringify([
    { title: "Hello", done: true },
    { title: "World" }
  ]);
  const result = validateImportJSON(valid);
  assert.deepEqual(result, [
    { title: "Hello", done: true },
    { title: "World", done: false }
  ]);

  // Invalid JSON formats
  assert.equal(validateImportJSON("not json"), null);
  assert.equal(validateImportJSON(JSON.stringify({ title: "not array" })), null);
  assert.equal(validateImportJSON(JSON.stringify([{ title: "" }])), null);
  assert.equal(validateImportJSON(JSON.stringify([{ title: "x".repeat(101) }])), null);
  assert.equal(validateImportJSON(JSON.stringify([{ title: 123 }])), null);
  assert.equal(validateImportJSON(JSON.stringify([{ title: "A", done: "yes" }])), null);
});

test("imports todos skipping case-insensitive duplicates", () => {
  const current = [
    { id: 1, title: "Apple", done: false },
    { id: 2, title: "Banana", done: true }
  ];
  const imports = [
    { title: "APPLE", done: true }, // duplicate
    { title: "cherry", done: false }, // new
    { title: "Banana", done: false } // duplicate
  ];
  
  const { todos, added, skipped } = importTodos(current, imports);
  assert.equal(added, 1);
  assert.equal(skipped, 2);
  assert.deepEqual(todos, [
    { id: 1, title: "Apple", done: false },
    { id: 2, title: "Banana", done: true },
    { id: 3, title: "cherry", done: false }
  ]);
});
