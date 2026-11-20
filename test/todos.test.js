import assert from "node:assert/strict";
import test from "node:test";

import { addTodo, MAX_TITLE, remaining, removeTodo, toggleTodo, toggleImportant } from "../lib/todos.js";

test("adds a todo with the next id and trims the title", () => {
  const todos = addTodo(addTodo([], "  Buy milk "), "Call Sam");
  assert.deepEqual(todos, [
    { id: 1, title: "Buy milk", done: false, important: false },
    { id: 2, title: "Call Sam", done: false, important: false }
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

test("toggles important status of a todo", () => {
  const todos = addTodo([], "a");
  assert.equal(todos[0].important, false);
  const toggled = toggleImportant(todos, 1);
  assert.equal(toggled[0].important, true);
  const untoggled = toggleImportant(toggled, 1);
  assert.equal(untoggled[0].important, false);
});
