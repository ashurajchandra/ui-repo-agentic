import assert from "node:assert/strict";
import test from "node:test";

import {
  addTodo,
  MAX_TITLE,
  remaining,
  removeTodo,
  toggleTodo,
  parseSettings,
  validateSettings,
  sortAndFilterTodos,
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

test("validateSettings returns correct defaults or validated values", () => {
  assert.deepEqual(validateSettings(null), null);
  assert.deepEqual(validateSettings({}), { showCompleted: true, sortBy: "newest" });
  assert.deepEqual(validateSettings({ showCompleted: false, sortBy: "alphabetical" }), { showCompleted: false, sortBy: "alphabetical" });
  assert.deepEqual(validateSettings({ showCompleted: "invalid", sortBy: "invalid" }), { showCompleted: true, sortBy: "newest" });
});

test("parseSettings handles JSON parsing and invalid inputs gracefully", () => {
  assert.deepEqual(parseSettings(null), { showCompleted: true, sortBy: "newest" });
  assert.deepEqual(parseSettings("invalid json"), { showCompleted: true, sortBy: "newest" });
  assert.deepEqual(parseSettings('{"showCompleted":false,"sortBy":"alphabetical"}'), { showCompleted: false, sortBy: "alphabetical" });
});

test("sortAndFilterTodos filters completed and sorts correctly", () => {
  const todos = [
    { id: 1, title: "B item", done: true },
    { id: 2, title: "A item", done: false },
    { id: 3, title: "C item", done: false },
  ];

  // Default: show completed, newest first (3, 2, 1)
  const defaultRes = sortAndFilterTodos(todos, null);
  assert.deepEqual(defaultRes.map(t => t.id), [3, 2, 1]);

  // Hide completed, newest first (3, 2)
  const hideDoneNewest = sortAndFilterTodos(todos, { showCompleted: false, sortBy: "newest" });
  assert.deepEqual(hideDoneNewest.map(t => t.id), [3, 2]);

  // Show completed, alphabetical (2, 1, 3) -> A item, B item, C item
  const showAlphabetical = sortAndFilterTodos(todos, { showCompleted: true, sortBy: "alphabetical" });
  assert.deepEqual(showAlphabetical.map(t => t.id), [2, 1, 3]);

  // Hide completed, alphabetical (2, 3) -> A item, C item
  const hideAlphabetical = sortAndFilterTodos(todos, { showCompleted: false, sortBy: "alphabetical" });
  assert.deepEqual(hideAlphabetical.map(t => t.id), [2, 3]);
});
