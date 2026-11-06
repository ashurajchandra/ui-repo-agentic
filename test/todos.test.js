import assert from "node:assert/strict";
import test from "node:test";

import { addTodo, MAX_TITLE, remaining, removeTodo, toggleTodo, updateTodoPriority, sortTodos } from "../lib/todos.js";

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

test("priority sorting works correctly (High first, then Medium, then Low)", () => {
  let todos = [];
  todos = addTodo(todos, "Task 1", "Low");
  todos = addTodo(todos, "Task 2", "High");
  todos = addTodo(todos, "Task 3", "Medium");
  
  // Sort order should be: High ("Task 2"), Medium ("Task 3"), Low ("Task 1")
  assert.equal(todos[0].title, "Task 2");
  assert.equal(todos[0].priority, "High");
  assert.equal(todos[1].title, "Task 3");
  assert.equal(todos[1].priority, "Medium");
  assert.equal(todos[2].title, "Task 1");
  assert.equal(todos[2].priority, "Low");
});

test("completed todos are always at the bottom", () => {
  let todos = [];
  todos = addTodo(todos, "Task 1", "Low");
  todos = addTodo(todos, "Task 2", "High");
  todos = addTodo(todos, "Task 3", "Medium");
  
  const task2 = todos.find(t => t.title === "Task 2");
  todos = toggleTodo(todos, task2.id);
  
  assert.equal(todos[0].title, "Task 3");
  assert.equal(todos[1].title, "Task 1");
  assert.equal(todos[2].title, "Task 2");
  assert.equal(todos[2].done, true);
});

test("legacy handling (undefined priority behaves as Medium)", () => {
  let todos = [
    { id: 1, title: "Legacy 1", done: false },
    { id: 2, title: "Low Priority", done: false, priority: "Low" },
    { id: 3, title: "High Priority", done: false, priority: "High" }
  ];
  
  todos = sortTodos(todos);
  
  assert.equal(todos[0].title, "High Priority");
  assert.equal(todos[1].title, "Legacy 1");
  assert.equal(todos[2].title, "Low Priority");
});

test("inline priority changes trigger correct re-sorting", () => {
  let todos = [];
  todos = addTodo(todos, "Task 1", "Low");
  todos = addTodo(todos, "Task 2", "Medium");
  
  assert.equal(todos[0].title, "Task 2");
  assert.equal(todos[1].title, "Task 1");
  
  const task1 = todos.find(t => t.title === "Task 1");
  todos = updateTodoPriority(todos, task1.id, "High");
  
  assert.equal(todos[0].title, "Task 1");
  assert.equal(todos[1].title, "Task 2");
});
