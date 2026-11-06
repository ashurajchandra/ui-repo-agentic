import assert from "node:assert/strict";
import test from "node:test";

import {
  addTodo,
  MAX_TITLE,
  remaining,
  removeTodo,
  toggleTodo,
  filterTodos,
  getCounts,
  recoverTodos,
  isOverdue,
  getDueText,
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

test("addTodo with optional due date", () => {
  const todos = addTodo([], "Buy groceries", "2023-11-12");
  assert.deepEqual(todos, [
    { id: 1, title: "Buy groceries", done: false, dueDate: "2023-11-12" }
  ]);
});

test("filterTodos and getCounts work correctly", () => {
  const todos = [
    { id: 1, title: "a", done: false },
    { id: 2, title: "b", done: true },
    { id: 3, title: "c", done: false },
  ];
  assert.deepEqual(filterTodos(todos, "active"), [
    { id: 1, title: "a", done: false },
    { id: 3, title: "c", done: false },
  ]);
  assert.deepEqual(filterTodos(todos, "completed"), [
    { id: 2, title: "b", done: true },
  ]);
  assert.deepEqual(filterTodos(todos, "all"), todos);
  assert.deepEqual(filterTodos(todos, "unknown"), todos);

  assert.deepEqual(getCounts(todos), { all: 3, active: 2, completed: 1 });
});

test("recoverTodos parses and handles corrupt JSON", () => {
  assert.deepEqual(recoverTodos(""), []);
  assert.deepEqual(recoverTodos("invalid json"), []);
  assert.deepEqual(recoverTodos('{"not": "an array"}'), []);
  assert.deepEqual(recoverTodos('[{"id": 1, "title": "test"}]'), [{ id: 1, title: "test" }]);
});

test("isOverdue and getDueText calculation", () => {
  const today = new Date("2023-11-15T12:00:00");
  
  // overdue incomplete todo
  assert.equal(isOverdue("2023-11-12", false, today), true);
  assert.equal(getDueText("2023-11-12", false, today), "Overdue · 12 Nov");

  // not overdue incomplete todo (today)
  assert.equal(isOverdue("2023-11-15", false, today), false);
  assert.equal(getDueText("2023-11-15", false, today), "Due 15 Nov");

  // not overdue incomplete todo (future)
  assert.equal(isOverdue("2023-11-20", false, today), false);
  assert.equal(getDueText("2023-11-20", false, today), "Due 20 Nov");

  // completed todo should never be overdue
  assert.equal(isOverdue("2023-11-12", true, today), false);
  assert.equal(getDueText("2023-11-12", true, today), "Due 12 Nov");
});
