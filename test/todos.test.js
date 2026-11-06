import assert from "node:assert/strict";
import test from "node:test";

import { addTodo, MAX_TITLE, remaining, removeTodo, toggleTodo, markDoneBulk, deleteBulk } from "../lib/todos.js";

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

test("markDoneBulk marks selected todos as done", () => {
  const todos = [
    { id: 1, title: "a", done: false },
    { id: 2, title: "b", done: false },
    { id: 3, title: "c", done: false }
  ];
  const updated = markDoneBulk(todos, [1, 3]);
  assert.deepEqual(updated, [
    { id: 1, title: "a", done: true },
    { id: 2, title: "b", done: false },
    { id: 3, title: "c", done: true }
  ]);
});

test("deleteBulk deletes selected todos", () => {
  const todos = [
    { id: 1, title: "a", done: false },
    { id: 2, title: "b", done: false },
    { id: 3, title: "c", done: false }
  ];
  const updated = deleteBulk(todos, [1, 3]);
  assert.deepEqual(updated, [
    { id: 2, title: "b", done: false }
  ]);
});

