import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { addTodo, MAX_TITLE, remaining, removeTodo, toggleTodo } from "../lib/todos.js";
import Todos from "../app/todos.js";

test("Todos component renders initial empty counter", () => {
  const html = renderToStaticMarkup(React.createElement(Todos));
  assert.match(html, /data-testid="char-counter"/);
  assert.match(html, /0 \/ 60/);
  assert.match(html, /maxLength="60"/);
});

test("Todos component renders different character counts and turns red at 60", () => {
  // Test with some characters
  const htmlMedium = renderToStaticMarkup(React.createElement(Todos, { initialTitle: "hello world" }));
  assert.match(htmlMedium, /11 \/ 60/);
  assert.ok(!htmlMedium.includes("color:red") && !htmlMedium.includes("color: red"));

  // Test at exactly 60 characters
  const sixtyChars = "a".repeat(60);
  const htmlFull = renderToStaticMarkup(React.createElement(Todos, { initialTitle: sixtyChars }));
  assert.match(htmlFull, /60 \/ 60/);
  assert.match(htmlFull, /color:red/);
});

test("adds a todo with the next id and trims the title", () => {
  const todos = addTodo(addTodo([], "  Buy milk "), "Call Sam");
  assert.deepEqual(todos, [
    { id: 1, title: "Buy milk", done: false },
    { id: 2, title: "Call Sam", done: false }
  ]);
});

test("ignores an empty title and cuts a very long one", () => {
  assert.equal(MAX_TITLE, 60);
  assert.deepEqual(addTodo([], "   "), []);
  assert.equal(addTodo([], "x".repeat(500))[0].title.length, MAX_TITLE);
});

test("toggles and removes by id, and counts what is left", () => {
  const todos = addTodo(addTodo([], "a"), "b");
  const toggled = toggleTodo(todos, 1);
  assert.equal(remaining(toggled), 1);
  assert.deepEqual(removeTodo(toggled, 1).map((todo) => todo.id), [2]);
});
