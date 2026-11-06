import assert from "node:assert/strict";
import test from "node:test";

import { addTodo, MAX_TITLE, remaining, removeTodo, toggleTodo, updateTodoPriority, sortTodos } from "../lib/todos.js";

test("adds a todo with the next id and trims the title", () => {
  const todos = addTodo(addTodo([], "  Buy milk "), "Call Sam");
  // Default priority is "Medium" when adding via default parameters
  assert.equal(todos[0].title, "Buy milk");
  assert.equal(todos[1].title, "Call Sam");
});

test("ignores an empty title and cuts a very long one", () => {
  assert.deepEqual(addTodo([], "   "), []);
  assert.equal(addTodo([], "x".repeat(500))[0].title.length, MAX_TITLE);
});

test("toggles and removes by id, and counts what is left", () => {
  const todos = addTodo(addTodo([], "a"), "b");
  const toggled = toggleTodo(todos, 1);
  assert.equal(remaining(toggled), 1);
  // completed goes to bottom, so remaining/open one is active
  assert.deepEqual(removeTodo(toggled, 1).map((todo) => todo.id), [2]);
});

test("sorting: sorts open todos first by priority (High, then Medium, then Low)", () => {
  let todos = [];
  todos = addTodo(todos, "Task Low", "Low");
  todos = addTodo(todos, "Task High", "High");
  todos = addTodo(todos, "Task Medium", "Medium");

  // Sorted order should be: Task High, Task Medium, Task Low
  assert.deepEqual(todos.map(t => t.title), ["Task High", "Task Medium", "Task Low"]);
});

test("sorting: preserves creation order within the same priority", () => {
  let todos = [];
  todos = addTodo(todos, "Medium 1", "Medium");
  todos = addTodo(todos, "High 1", "High");
  todos = addTodo(todos, "Medium 2", "Medium");
  todos = addTodo(todos, "High 2", "High");

  assert.deepEqual(todos.map(t => t.title), [
    "High 1",
    "High 2",
    "Medium 1",
    "Medium 2"
  ]);
});

test("sorting: completed todos stay at the bottom of the list", () => {
  let todos = [];
  todos = addTodo(todos, "Task Low", "Low");
  todos = addTodo(todos, "Task High", "High");
  todos = addTodo(todos, "Task Medium", "Medium");

  // Toggle "Task High" (id: 2) to done
  todos = toggleTodo(todos, 2);

  // Task High is completed, so it should go to the very bottom.
  // The remaining open tasks are Task Medium (Medium) and Task Low (Low).
  assert.deepEqual(todos.map(t => t.title), ["Task Medium", "Task Low", "Task High"]);
});

test("sorting: legacy todos without priority are treated as Medium", () => {
  const legacyTodos = [
    { id: 1, title: "Legacy 1", done: false }, // missing priority -> Medium
    { id: 2, title: "High Task", done: false, priority: "High" },
    { id: 3, title: "Low Task", done: false, priority: "Low" },
    { id: 4, title: "Medium Task", done: false, priority: "Medium" }
  ];

  const sorted = sortTodos(legacyTodos);
  assert.deepEqual(sorted.map(t => t.title), [
    "High Task",
    "Legacy 1",      // Legacy 1 comes before Medium Task due to creation order (id 1 vs 4)
    "Medium Task",
    "Low Task"
  ]);
});

test("sorting: changing priority re-sorts list immediately", () => {
  let todos = [];
  todos = addTodo(todos, "Task A", "Low");
  todos = addTodo(todos, "Task B", "Medium");

  // Order: Task B (Medium), Task A (Low)
  assert.deepEqual(todos.map(t => t.title), ["Task B", "Task A"]);

  // Change Task A's priority to High
  todos = updateTodoPriority(todos, 1, "High");

  // Order: Task A (High), Task B (Medium)
  assert.deepEqual(todos.map(t => t.title), ["Task A", "Task B"]);
});
