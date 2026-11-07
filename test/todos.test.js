import assert from "node:assert/strict";
import test from "node:test";

import { addTodo, MAX_TITLE, remaining, removeTodo, toggleTodo, moveTodo } from "../lib/todos.js";

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

test("moveTodo moves a todo up or down, and handles boundaries/errors", () => {
  const todos = [
    { id: 1, title: "a", done: false },
    { id: 2, title: "b", done: false },
    { id: 3, title: "c", done: false }
  ];
  
  // normal move up
  const movedUp = moveTodo(todos, 2, "up");
  assert.deepEqual(movedUp, [
    { id: 2, title: "b", done: false },
    { id: 1, title: "a", done: false },
    { id: 3, title: "c", done: false }
  ]);

  // normal move down
  const movedDown = moveTodo(todos, 2, "down");
  assert.deepEqual(movedDown, [
    { id: 1, title: "a", done: false },
    { id: 3, title: "c", done: false },
    { id: 2, title: "b", done: false }
  ]);

  // boundary: first item up
  assert.deepEqual(moveTodo(todos, 1, "up"), todos);

  // boundary: last item down
  assert.deepEqual(moveTodo(todos, 3, "down"), todos);

  // invalid direction
  assert.deepEqual(moveTodo(todos, 2, "invalid"), todos);

  // non-existent id
  assert.deepEqual(moveTodo(todos, 99, "up"), todos);
});

