import assert from "node:assert/strict";
import test from "node:test";

import {
  addTodo,
  MAX_TITLE,
  remaining,
  removeTodo,
  toggleTodo,
  sanitizeSavedTodos,
  validateImportJSON,
  importTodos,
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

test("sanitizeSavedTodos handles malformed and good values", () => {
  assert.deepEqual(sanitizeSavedTodos(null), []);
  assert.deepEqual(sanitizeSavedTodos({}), []);
  assert.deepEqual(
    sanitizeSavedTodos([
      { id: 1, title: "Valid todo", done: true },
      null,
      "not an object",
      { id: "invalid-id", title: "Bad ID" },
      { id: 2, title: "Valid false done" } // done missing defaults to false
    ]),
    [
      { id: 1, title: "Valid todo", done: true },
      { id: 2, title: "Valid false done", done: false }
    ]
  );
});

test("validateImportJSON schema validation rules", () => {
  // Good cases
  const validText = JSON.stringify([{ title: "Do laundry", done: true }, { title: "Clean room" }]);
  assert.deepEqual(validateImportJSON(validText), [
    { title: "Do laundry", done: true },
    { title: "Clean room", done: false }
  ]);

  // Invalid JSON
  assert.equal(validateImportJSON("{malformed"), null);
  // Not an array
  assert.equal(validateImportJSON('{"title": "abc"}'), null);
  // Non-object item
  assert.equal(validateImportJSON('[123]'), null);
  // Missing or empty title
  assert.equal(validateImportJSON('[{"done": true}]'), null);
  assert.equal(validateImportJSON('[{"title": " "}]'), null);
  // Title too long (>100 chars)
  assert.equal(validateImportJSON(JSON.stringify([{ title: "a".repeat(101) }])), null);
  // Invalid done type
  assert.equal(validateImportJSON('[{"title": "Valid", "done": "yes"}]'), null);
});

test("importTodos skips case-insensitive duplicates", () => {
  const current = [
    { id: 1, title: "Buy Milk", done: false },
    { id: 2, title: "Call Bob", done: true }
  ];
  const imported = [
    { title: "buy milk", done: true }, // duplicate
    { title: "Call Sam", done: false }, // new
    { title: "CALL BOB ", done: false } // duplicate
  ];

  const result = importTodos(current, imported);
  assert.equal(result.added, 1);
  assert.equal(result.skipped, 2);
  assert.deepEqual(result.todos, [
    { id: 1, title: "Buy Milk", done: false },
    { id: 2, title: "Call Bob", done: true },
    { id: 3, title: "Call Sam", done: false }
  ]);
});

test("moveTodo respects boundary movement", () => {
  const todos = [
    { id: 1, title: "A", done: false },
    { id: 2, title: "B", done: false },
    { id: 3, title: "C", done: false }
  ];

  // Boundary checks
  assert.deepEqual(moveTodo(todos, 1, "up"), todos); // cannot move first up
  assert.deepEqual(moveTodo(todos, 3, "down"), todos); // cannot move last down

  // Move up
  const movedUp = moveTodo(todos, 2, "up");
  assert.deepEqual(movedUp, [
    { id: 2, title: "B", done: false },
    { id: 1, title: "A", done: false },
    { id: 3, title: "C", done: false }
  ]);

  // Move down
  const movedDown = moveTodo(todos, 2, "down");
  assert.deepEqual(movedDown, [
    { id: 1, title: "A", done: false },
    { id: 3, title: "C", done: false },
    { id: 2, title: "B", done: false }
  ]);
});

test("loading of a saved order via sanitizeSavedTodos", () => {
  const saved = [
    { id: 3, title: "Third", done: false },
    { id: 1, title: "First", done: true },
    { id: 2, title: "Second", done: false }
  ];
  const loaded = sanitizeSavedTodos(saved);
  assert.deepEqual(loaded, saved);
});
