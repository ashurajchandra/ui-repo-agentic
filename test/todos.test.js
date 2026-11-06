import assert from "node:assert/strict";
import test from "node:test";

import { addTodo, MAX_TITLE, remaining, removeTodo, toggleTodo, editTodo, clearCompletedTodos } from "../lib/todos.js";

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

test("editTodo edits title with trim, truncation, and ignores empty edit", () => {
  const todos = [
    { id: 1, title: "Buy milk", done: false },
    { id: 2, title: "Call Sam", done: false }
  ];

  // Normal edit
  let updated = editTodo(todos, 1, "Buy organic milk");
  assert.equal(updated[0].title, "Buy organic milk");

  // Trimmed edit
  updated = editTodo(todos, 1, "   Buy soy milk   ");
  assert.equal(updated[0].title, "Buy soy milk");

  // Discards empty or whitespace-only edit
  updated = editTodo(todos, 1, "");
  assert.equal(updated[0].title, "Buy milk");
  updated = editTodo(todos, 1, "   ");
  assert.equal(updated[0].title, "Buy milk");

  // Truncates long edit to MAX_TITLE
  const longTitle = "x".repeat(MAX_TITLE + 50);
  updated = editTodo(todos, 1, longTitle);
  assert.equal(updated[0].title.length, MAX_TITLE);
  assert.equal(updated[0].title, "x".repeat(MAX_TITLE));
});

test("clearCompletedTodos batch clears completed items", () => {
  const todos = [
    { id: 1, title: "Buy milk", done: true },
    { id: 2, title: "Call Sam", done: false },
    { id: 3, title: "Learn React", done: true }
  ];

  const cleared = clearCompletedTodos(todos);
  assert.deepEqual(cleared, [
    { id: 2, title: "Call Sam", done: false }
  ]);
});
