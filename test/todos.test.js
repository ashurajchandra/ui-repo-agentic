import assert from "node:assert/strict";
import test from "node:test";

import { addTodo, MAX_TITLE, remaining, removeTodo, toggleTodo, updateDueDate } from "../lib/todos.js";

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

test("creating with a due date sets the dueDate property", () => {
  const todos = addTodo([], "Finish homework", "2025-12-31");
  assert.deepEqual(todos, [
    { id: 1, title: "Finish homework", done: false, dueDate: "2025-12-31" }
  ]);
});

test("legacy/prior todos function normally without a dueDate", () => {
  const legacyTodo = { id: 1, title: "Old task", done: false };
  const updated = toggleTodo([legacyTodo], 1);
  assert.equal(updated[0].dueDate, undefined);
  assert.equal(updated[0].done, true);
});

test("updating due dates updates existing todo", () => {
  const todos = addTodo([], "Task", "2025-12-31");
  const updated = updateDueDate(todos, 1, "2026-01-01");
  assert.equal(updated[0].dueDate, "2026-01-01");
});

test("clearing due dates removes or deletes the dueDate property", () => {
  const todos = addTodo([], "Task", "2025-12-31");
  const updated = updateDueDate(todos, 1, "");
  assert.equal(updated[0].dueDate, undefined);
});
