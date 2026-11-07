import assert from "node:assert/strict";
import test from "node:test";
import { exportTodos, parseAndValidateImport, importTodos } from "../lib/todo-transfer.js";

test("exportTodos correctly maps title and done keys", () => {
  const todos = [
    { id: 1, title: "Buy milk", done: false, otherKey: "ignored" },
    { id: 2, title: "Call Sam", done: true }
  ];
  const exported = exportTodos(todos);
  assert.deepEqual(exported, [
    { title: "Buy milk", done: false },
    { title: "Call Sam", done: true }
  ]);
});

test("parseAndValidateImport parses correct JSON and detects format errors", () => {
  // Valid JSON
  const validText = JSON.stringify([
    { title: "Buy milk", done: false },
    { title: "Call Sam" }
  ]);
  const res1 = parseAndValidateImport(validText);
  assert.equal(res1.valid, true);
  assert.deepEqual(res1.todos, [
    { title: "Buy milk", done: false },
    { title: "Call Sam", done: false }
  ]);

  // Invalid JSON structure
  const invalidJson = "{ invalid";
  const res2 = parseAndValidateImport(invalidJson);
  assert.equal(res2.valid, false);

  // Not an array
  const notArray = JSON.stringify({ title: "abc" });
  const res3 = parseAndValidateImport(notArray);
  assert.equal(res3.valid, false);

  // Empty title
  const emptyTitle = JSON.stringify([{ title: " " }]);
  const res4 = parseAndValidateImport(emptyTitle);
  assert.equal(res4.valid, false);

  // Title too long
  const longTitle = JSON.stringify([{ title: "a".repeat(101) }]);
  const res5 = parseAndValidateImport(longTitle);
  assert.equal(res5.valid, false);

  // Done not boolean
  const badDone = JSON.stringify([{ title: "abc", done: "yes" }]);
  const res6 = parseAndValidateImport(badDone);
  assert.equal(res6.valid, false);
});

test("importTodos skips case-insensitive duplicates and creates unique IDs", () => {
  const existing = [
    { id: 5, title: "Buy Milk", done: false }
  ];
  const imported = [
    { title: "buy milk", done: true }, // skip
    { title: "Call Sam", done: true }   // add
  ];

  const result = importTodos(existing, imported);
  assert.equal(result.added, 1);
  assert.equal(result.skipped, 1);
  assert.deepEqual(result.todos, [
    { id: 5, title: "Buy Milk", done: false },
    { id: 6, title: "Call Sam", done: true }
  ]);
});
