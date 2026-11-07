import assert from "node:assert/strict";
import test from "node:test";

import {
  addTodo,
  MAX_TITLE,
  remaining,
  removeTodo,
  toggleTodo,
  addTag,
  removeTag,
  validateAndMigrateTodos,
} from "../lib/todos.js";

test("adds a todo with the next id and trims the title", () => {
  const todos = addTodo(addTodo([], "  Buy milk "), "Call Sam");
  assert.deepEqual(todos, [
    { id: 1, title: "Buy milk", done: false, tags: [] },
    { id: 2, title: "Call Sam", done: false, tags: [] },
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

// Unit tests covering tag additions (lowercase conversion, length, duplicates)
test("tag additions handles lowercase conversion, duplicates, and length validation", () => {
  let todos = [{ id: 1, title: "Test", done: false, tags: [] }];

  // Lowercase conversion
  todos = addTag(todos, 1, "Work");
  assert.deepEqual(todos[0].tags, ["work"]);

  // Duplicates are ignored
  todos = addTag(todos, 1, "work");
  assert.deepEqual(todos[0].tags, ["work"]);

  todos = addTag(todos, 1, "WORK");
  assert.deepEqual(todos[0].tags, ["work"]);

  // Empty tags or whitespace-only tags are ignored
  todos = addTag(todos, 1, "   ");
  assert.deepEqual(todos[0].tags, ["work"]);

  // Long tags (> 20 characters) are ignored
  const longTag = "a".repeat(21);
  todos = addTag(todos, 1, longTag);
  assert.deepEqual(todos[0].tags, ["work"]);

  // Tag up to 20 characters is fine
  const limitTag = "b".repeat(20);
  todos = addTag(todos, 1, limitTag);
  assert.deepEqual(todos[0].tags, ["work", limitTag]);
});

// Tag removal unit tests
test("tag removal works correctly", () => {
  let todos = [{ id: 1, title: "Test", done: false, tags: ["work", "home"] }];
  todos = removeTag(todos, 1, "work");
  assert.deepEqual(todos[0].tags, ["home"]);

  // Case insensitive removal
  todos = removeTag(todos, 1, "HOME");
  assert.deepEqual(todos[0].tags, []);
});

// Loading malformed / legacy storage data unit tests
test("validateAndMigrateTodos loads legacy/malformed storage safely", () => {
  // Legacy todo without tags
  const legacy = [{ id: 1, title: "Legacy", done: false }];
  const migratedLegacy = validateAndMigrateTodos(legacy);
  assert.deepEqual(migratedLegacy, [{ id: 1, title: "Legacy", done: false, tags: [] }]);

  // Non-array input
  assert.deepEqual(validateAndMigrateTodos(null), []);
  assert.deepEqual(validateAndMigrateTodos("string"), []);

  // Malformed structure
  const malformed = [
    { id: 1, title: "Valid", done: false, tags: ["work", "invalidtaglengthlongerthantwenty"] },
    { id: "invalid-id", title: "Missing numeric id", done: false },
    { id: 2, done: true }, // missing title
    null,
    undefined,
    "not-an-object",
  ];
  const migratedMalformed = validateAndMigrateTodos(malformed);
  assert.deepEqual(migratedMalformed, [
    { id: 1, title: "Valid", done: false, tags: ["work"] },
  ]);
});

// Combined filters unit tests (filters combined with tabs)
test("filters combined with tabs filters the todos list correctly", () => {
  const todos = [
    { id: 1, title: "Todo A", done: false, tags: ["work"] },
    { id: 2, title: "Todo B", done: true, tags: ["work"] },
    { id: 3, title: "Todo C", done: false, tags: ["home"] },
    { id: 4, title: "Todo D", done: true, tags: [] },
  ];

  // Helper function mimicking the react application filtering logic
  function getFilteredTodos(list, activeTab, selectedTag) {
    const filteredByTab = list.filter((t) => {
      if (activeTab === "active") return !t.done;
      if (activeTab === "done") return t.done;
      return true;
    });

    return filteredByTab.filter((t) => {
      if (selectedTag === "All tags") return true;
      return t.tags && t.tags.includes(selectedTag);
    });
  }

  // All + All tags
  assert.deepEqual(
    getFilteredTodos(todos, "all", "All tags").map((t) => t.id),
    [1, 2, 3, 4]
  );

  // Active + All tags
  assert.deepEqual(
    getFilteredTodos(todos, "active", "All tags").map((t) => t.id),
    [1, 3]
  );

  // Done + All tags
  assert.deepEqual(
    getFilteredTodos(todos, "done", "All tags").map((t) => t.id),
    [2, 4]
  );

  // All + "work"
  assert.deepEqual(
    getFilteredTodos(todos, "all", "work").map((t) => t.id),
    [1, 2]
  );

  // Active + "work"
  assert.deepEqual(
    getFilteredTodos(todos, "active", "work").map((t) => t.id),
    [1]
  );

  // Done + "work"
  assert.deepEqual(
    getFilteredTodos(todos, "done", "work").map((t) => t.id),
    [2]
  );

  // Active + "home"
  assert.deepEqual(
    getFilteredTodos(todos, "active", "home").map((t) => t.id),
    [3]
  );

  // Done + "home" (empty)
  assert.deepEqual(
    getFilteredTodos(todos, "done", "home").map((t) => t.id),
    []
  );
});
