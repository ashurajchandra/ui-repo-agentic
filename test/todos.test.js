import assert from "node:assert/strict";
import test from "node:test";

import {
  addTodo,
  MAX_TITLE,
  remaining,
  removeTodo,
  toggleTodo,
  exportTodos,
  validateTodosJSON,
  addImportedTodos,
  moveTodo,
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

test("exports todos to correct JSON schema structure", () => {
  const todos = [
    { id: 1, title: "Task 1", done: false },
    { id: 2, title: "Task 2", done: true, ignored: "yes" }
  ];
  const exported = exportTodos(todos);
  const parsed = JSON.parse(exported);
  assert.deepEqual(parsed, [
    { title: "Task 1", done: false },
    { title: "Task 2", done: true }
  ]);
});

test("validateTodosJSON checks various invalid and valid formats", () => {
  // Valid JSON
  const validText = JSON.stringify([{ title: "Good item", done: true }, { title: "Another" }]);
  const resultValid = validateTodosJSON(validText);
  assert.equal(resultValid.valid, true);
  assert.equal(resultValid.todos.length, 2);

  // Invalid JSON (syntax error)
  assert.equal(validateTodosJSON("{bad json}").valid, false);

  // Non-array
  assert.equal(validateTodosJSON(JSON.stringify({ title: "Oops" })).valid, false);

  // Non-object item
  assert.equal(validateTodosJSON(JSON.stringify(["just string"])).valid, false);

  // Missing title
  assert.equal(validateTodosJSON(JSON.stringify([{ done: true }])).valid, false);

  // Empty title
  assert.equal(validateTodosJSON(JSON.stringify([{ title: "   ", done: true }])).valid, false);

  // Too long title
  assert.equal(validateTodosJSON(JSON.stringify([{ title: "a".repeat(101) }])).valid, false);

  // Invalid done type
  assert.equal(validateTodosJSON(JSON.stringify([{ title: "Hi", done: "yes" }])).valid, false);
});

test("addImportedTodos appends valid, skipping case-insensitive duplicates", () => {
  const existing = [
    { id: 1, title: "Buy milk", done: false },
    { id: 2, title: "Call Sam", done: true }
  ];
  const imported = [
    { title: "BUY MILK", done: true }, // Duplicate, should skip
    { title: "Clean room", done: false }, // New, should add
    { title: "clean room", done: true }, // Duplicate of newly added, should skip
    { title: "Call Sam", done: false } // Duplicate, should skip
  ];

  const res = addImportedTodos(existing, imported);
  assert.equal(res.addedCount, 1);
  assert.equal(res.skippedCount, 3);
  assert.equal(res.todos.length, 3);
  assert.equal(res.todos[2].title, "Clean room");
  assert.equal(res.todos[2].id, 3);
});

test("moveTodo handles direction and boundaries correctly", () => {
  const todos = [
    { id: 1, title: "A", done: false },
    { id: 2, title: "B", done: false },
    { id: 3, title: "C", done: false }
  ];

  // Move middle up
  const upMiddle = moveTodo(todos, 2, "up");
  assert.deepEqual(upMiddle.map(t => t.id), [2, 1, 3]);

  // Move middle down
  const downMiddle = moveTodo(todos, 2, "down");
  assert.deepEqual(downMiddle.map(t => t.id), [1, 3, 2]);

  // Move top up (no-op)
  assert.deepEqual(moveTodo(todos, 1, "up").map(t => t.id), [1, 2, 3]);

  // Move bottom down (no-op)
  assert.deepEqual(moveTodo(todos, 3, "down").map(t => t.id), [1, 2, 3]);
});
