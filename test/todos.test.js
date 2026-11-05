import assert from "node:assert/strict";
import test from "node:test";

import { addTodo, MAX_TITLE, remaining, removeTodo, toggleTodo } from "../lib/todos.js";

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

test("marking a task as completed leaves it in the list retaining status", () => {
  const initialTodos = [
    { id: 1, title: "Task 1", done: false },
    { id: 2, title: "Task 2", done: false }
  ];
  const updatedTodos = toggleTodo(initialTodos, 1);
  
  // Completed item is still in the array
  assert.equal(updatedTodos.length, 2);
  const task1 = updatedTodos.find(t => t.id === 1);
  assert.ok(task1);
  assert.equal(task1.done, true);
});

test("deleting a task completely removes/purges it from the state array", () => {
  const initialTodos = [
    { id: 1, title: "Task 1", done: false },
    { id: 2, title: "Task 2", done: false }
  ];
  const updatedTodos = removeTodo(initialTodos, 1);
  
  // Deleted item is completely removed from the array
  assert.equal(updatedTodos.length, 1);
  const task1 = updatedTodos.find(t => t.id === 1);
  assert.equal(task1, undefined);
});

