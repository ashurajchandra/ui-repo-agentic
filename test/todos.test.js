import assert from "node:assert/strict";
import test from "node:test";

import {
  addTodo,
  MAX_TITLE,
  remaining,
  removeTodo,
  toggleTodo,
  validateSettings,
  validateTodos,
  filterAndSortTodos,
  DEFAULT_SETTINGS
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

test("validateSettings recovers from corrupt or invalid data gracefully", () => {
  assert.deepEqual(validateSettings(null), DEFAULT_SETTINGS);
  assert.deepEqual(validateSettings({}), DEFAULT_SETTINGS);
  assert.deepEqual(validateSettings({ showCompleted: "not a boolean", sortBy: "Invalid Sort" }), DEFAULT_SETTINGS);
  assert.deepEqual(validateSettings({ showCompleted: false, sortBy: "Title A–Z" }), {
    showCompleted: false,
    sortBy: "Title A–Z"
  });
});

test("validateTodos filters out invalid and malformed items", () => {
  assert.deepEqual(validateTodos(null), []);
  assert.deepEqual(validateTodos({}), []);
  assert.deepEqual(validateTodos([
    { id: 1, title: "valid", done: false },
    { id: "2", title: "invalid id", done: false },
    { id: 3, title: 1234, done: false },
    { title: "missing id" }
  ]), [
    { id: 1, title: "valid", done: false }
  ]);
});

test("filterAndSortTodos correctly filters completed tasks and sorts them", () => {
  const todos = [
    { id: 1, title: "Banana", done: false },
    { id: 2, title: "Apple", done: true },
    { id: 3, title: "Cherry", done: false }
  ];

  // Default settings: showCompleted = true, sortBy = "Newest first"
  const defaultRes = filterAndSortTodos(todos, DEFAULT_SETTINGS);
  assert.deepEqual(defaultRes.map(t => t.id), [3, 2, 1]);

  // Hide completed
  const hideCompletedRes = filterAndSortTodos(todos, { showCompleted: false, sortBy: "Newest first" });
  assert.deepEqual(hideCompletedRes.map(t => t.id), [3, 1]);

  // Sort by Title A-Z, showCompleted = true
  const titleSortRes = filterAndSortTodos(todos, { showCompleted: true, sortBy: "Title A–Z" });
  assert.deepEqual(titleSortRes.map(t => t.title), ["Apple", "Banana", "Cherry"]);
});

test("simulate undo transitions", () => {
  let todos = [
    { id: 1, title: "A", done: false },
    { id: 2, title: "B", done: true }
  ];
  // Backup before delete
  const backup = [...todos];
  todos = removeTodo(todos, 1);
  assert.deepEqual(todos, [{ id: 2, title: "B", done: true }]);
  // Restore
  todos = backup;
  assert.deepEqual(todos, [
    { id: 1, title: "A", done: false },
    { id: 2, title: "B", done: true }
  ]);
});
