import assert from "node:assert/strict";
import test from "node:test";

import {
  addField,
  getDefaultLabel,
  getEffectiveLabel,
  parseOptions,
  removeField,
  updateField,
} from "../lib/form-fields.js";

test("getDefaultLabel returns standard defaults", () => {
  assert.equal(getDefaultLabel("text"), "Untitled text");
  assert.equal(getDefaultLabel("email"), "Untitled email");
  assert.equal(getDefaultLabel("checkbox"), "Untitled checkbox");
  assert.equal(getDefaultLabel("dropdown"), "Untitled dropdown");
  assert.equal(getDefaultLabel("unknown"), "Untitled field");
});

test("getEffectiveLabel trims labels over 60 characters and falls back when empty", () => {
  assert.equal(getEffectiveLabel("", "text"), "Untitled text");
  assert.equal(getEffectiveLabel("   ", "email"), "Untitled email");
  assert.equal(getEffectiveLabel(null, "checkbox"), "Untitled checkbox");
  
  const longLabel = "a".repeat(100);
  assert.equal(getEffectiveLabel(longLabel, "text"), "a".repeat(60));
  assert.equal(getEffectiveLabel("Custom Label", "dropdown"), "Custom Label");
});

test("parseOptions splits text by newline, trims, and filters out empty lines", () => {
  const input = "  Option 1 \n\n  Option 2\nOption 3  \n  ";
  assert.deepEqual(parseOptions(input), ["Option 1", "Option 2", "Option 3"]);
  assert.deepEqual(parseOptions(null), []);
  assert.deepEqual(parseOptions(""), []);
});

test("addField, removeField, and updateField manage field list state immutably", () => {
  let fields = [];
  
  // Add field
  fields = addField(fields, "text");
  assert.equal(fields.length, 1);
  assert.equal(fields[0].id, 1);
  assert.equal(fields[0].type, "text");
  assert.equal(fields[0].label, "Untitled text");

  // Add another field
  fields = addField(fields, "dropdown");
  assert.equal(fields.length, 2);
  assert.equal(fields[1].id, 2);
  assert.equal(fields[1].type, "dropdown");

  // Update field
  fields = updateField(fields, 1, { label: "My Custom Label" });
  assert.equal(fields[0].label, "My Custom Label");

  // Remove field
  fields = removeField(fields, 1);
  assert.equal(fields.length, 1);
  assert.equal(fields[0].id, 2);
});
