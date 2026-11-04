import assert from "node:assert/strict";
import test from "node:test";

import {
  addTodo,
  MAX_TITLE,
  remaining,
  removeTodo,
  toggleTodo,
  isOverdue,
  sortOpenTodos,
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

test("adds a todo with optional dueDate", () => {
  const todos = addTodo([], "Buy milk", "2023-10-31");
  assert.deepEqual(todos, [
    { id: 1, title: "Buy milk", done: false, dueDate: "2023-10-31" }
  ]);
});

test("isOverdue flags open past due tasks, but not completed or future/today ones", () => {
  const today = new Date("2023-10-15T12:00:00Z");
  
  const pastTodo = { id: 1, title: "Past", done: false, dueDate: "2023-10-14" };
  const todayTodo = { id: 2, title: "Today", done: false, dueDate: "2023-10-15" };
  const futureTodo = { id: 3, title: "Future", done: false, dueDate: "2023-10-16" };
  const pastDoneTodo = { id: 4, title: "Past Done", done: true, dueDate: "2023-10-14" };
  const noDateTodo = { id: 5, title: "No Date", done: false };

  assert.equal(isOverdue(pastTodo, today), true);
  assert.equal(isOverdue(todayTodo, today), false);
  assert.equal(isOverdue(futureTodo, today), false);
  assert.equal(isOverdue(pastDoneTodo, today), false);
  assert.equal(isOverdue(noDateTodo, today), false);
});

test("sortOpenTodos sorts chronologically by due date (earliest first, no date last), keeping completed at the end", () => {
  const todos = [
    { id: 1, title: "No Date 1", done: false },
    { id: 2, title: "Future 1", done: false, dueDate: "2023-10-20" },
    { id: 3, title: "Past 1", done: false, dueDate: "2023-10-10" },
    { id: 4, title: "Completed Past", done: true, dueDate: "2023-10-05" },
    { id: 5, title: "Completed No Date", done: true },
    { id: 6, title: "Future 2", done: false, dueDate: "2023-10-18" },
    { id: 7, title: "No Date 2", done: false }
  ];

  const sorted = sortOpenTodos(todos);
  
  // Open with due dates sorted: Future 2 (10-18), Future 1 (10-20), Past 1 (10-10) -> wait, 10-10 is the earliest, then 10-18, then 10-20
  // So: Past 1 (10-10), Future 2 (10-18), Future 1 (10-20)
  // Followed by open with NO due dates: No Date 1, No Date 2
  // Followed by completed todos: Completed Past, Completed No Date
  const expectedOrder = [3, 6, 2, 1, 7, 4, 5];
  assert.deepEqual(sorted.map(t => t.id), expectedOrder);
});
