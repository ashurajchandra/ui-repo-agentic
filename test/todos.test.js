import assert from "node:assert/strict";
import test from "node:test";

import {
  addTodo,
  MAX_TITLE,
  remaining,
  removeTodo,
  toggleTodo,
  moveTodoUp,
  moveTodoDown,
  exportTodos,
  validateImport
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

test("moves a todo up and down correctly", () => {
  const todos = [
    { id: 1, title: "a", done: false },
    { id: 2, title: "b", done: false },
    { id: 3, title: "c", done: false }
  ];
  const up = moveTodoUp(todos, 2);
  assert.deepEqual(up.map(t => t.id), [2, 1, 3]);

  const upFirst = moveTodoUp(todos, 1);
  assert.deepEqual(upFirst.map(t => t.id), [1, 2, 3]);

  const down = moveTodoDown(todos, 2);
  assert.deepEqual(down.map(t => t.id), [1, 3, 2]);

  const downLast = moveTodoDown(todos, 3);
  assert.deepEqual(downLast.map(t => t.id), [1, 2, 3]);
});

test("exports todos to clean JSON with title and done", () => {
  const todos = [
    { id: 1, title: "a", done: false },
    { id: 2, title: "b", done: true }
  ];
  const json = exportTodos(todos);
  const parsed = JSON.parse(json);
  assert.deepEqual(parsed, [
    { title: "a", done: false },
    { title: "b", done: true }
  ]);
});

test("validates import JSON formats", () => {
  assert.deepEqual(validateImport("invalid json"), { valid: false, error: "This is not a list of todos" });
  assert.deepEqual(validateImport("{}"), { valid: false, error: "This is not a list of todos" });
  assert.deepEqual(validateImport("123"), { valid: false, error: "This is not a list of todos" });

  const validJSON = JSON.stringify([
    { title: "Buy coffee", done: true },
    { title: "Walk dog" }
  ]);
  const res = validateImport(validJSON);
  assert.equal(res.valid, true);
  assert.equal(res.todos.length, 2);
  assert.equal(res.todos[0].title, "Buy coffee");
  assert.equal(res.todos[0].done, true);
  assert.equal(res.todos[1].title, "Walk dog");
  assert.equal(res.todos[1].done, false);

  const longTitleJSON = JSON.stringify([{ title: "x".repeat(101) }]);
  assert.deepEqual(validateImport(longTitleJSON), { valid: false, error: "This is not a list of todos" });

  const emptyTitleJSON = JSON.stringify([{ title: "" }]);
  assert.deepEqual(validateImport(emptyTitleJSON), { valid: false, error: "This is not a list of todos" });

  const wrongDoneTypeJSON = JSON.stringify([{ title: "abc", done: "yes" }]);
  assert.deepEqual(validateImport(wrongDoneTypeJSON), { valid: false, error: "This is not a list of todos" });
});
