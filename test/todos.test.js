import assert from "node:assert/strict";
import test from "node:test";

import { addTodo, MAX_TITLE, remaining, removeTodo, toggleTodo, markDoneMultiple, removeMultiple } from "../lib/todos.js";

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

test("markDoneMultiple and removeMultiple perform bulk operations correctly", () => {
  const todos = [
    { id: 1, title: "task 1", done: false },
    { id: 2, title: "task 2", done: false },
    { id: 3, title: "task 3", done: false }
  ];
  
  const marked = markDoneMultiple(todos, [1, 3]);
  assert.deepEqual(marked, [
    { id: 1, title: "task 1", done: true },
    { id: 2, title: "task 2", done: false },
    { id: 3, title: "task 3", done: true }
  ]);

  const removed = removeMultiple(todos, [1, 3]);
  assert.deepEqual(removed, [
    { id: 2, title: "task 2", done: false }
  ]);
});
