import assert from "node:assert/strict";
import test from "node:test";

import { addTodo, MAX_TITLE, remaining, removeTodo, toggleTodo, swapTodos } from "../lib/todos.js";

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

test("swapTodos swaps elements correctly and handles bounds and edge cases", () => {
  const initial = [
    { id: 1, title: "a", done: false },
    { id: 2, title: "b", done: false },
    { id: 3, title: "c", done: false }
  ];
  
  // Swap middle with first
  const swapped1 = swapTodos(initial, 1, 0);
  assert.deepEqual(swapped1, [
    { id: 2, title: "b", done: false },
    { id: 1, title: "a", done: false },
    { id: 3, title: "c", done: false }
  ]);
  
  // Swap middle with last
  const swapped2 = swapTodos(initial, 1, 2);
  assert.deepEqual(swapped2, [
    { id: 1, title: "a", done: false },
    { id: 3, title: "c", done: false },
    { id: 2, title: "b", done: false }
  ]);

  // Out of bounds fromIndex
  assert.deepEqual(swapTodos(initial, -1, 1), initial);
  assert.deepEqual(swapTodos(initial, 3, 1), initial);

  // Out of bounds toIndex
  assert.deepEqual(swapTodos(initial, 1, -1), initial);
  assert.deepEqual(swapTodos(initial, 1, 3), initial);

  // Equal indices
  assert.deepEqual(swapTodos(initial, 1, 1), initial);

  // Non-array input
  assert.deepEqual(swapTodos(null, 0, 1), []);
});
