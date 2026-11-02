import assert from "node:assert/strict";
import test from "node:test";
import { exportForm, importForm } from "../lib/form-json.js";

test("happy path: export and import a valid form", () => {
  const fields = [
    { id: 42, type: "text", label: "Full Name", options: "" },
    { id: 43, type: "dropdown", label: "Country", options: "USA\nCanada" }
  ];

  const exported = exportForm(fields);
  const parsed = JSON.parse(exported);

  assert.equal(parsed.version, 1);
  assert.equal(parsed.fields.length, 2);
  assert.equal(parsed.fields[0].label, "Full Name");
  assert.equal(parsed.fields[1].label, "Country");

  const imported = importForm(exported);
  assert.equal(imported.length, 2);
  // check regenerated IDs starting from 1
  assert.equal(imported[0].id, 1);
  assert.equal(imported[0].type, "text");
  assert.equal(imported[0].label, "Full Name");

  assert.equal(imported[1].id, 2);
  assert.equal(imported[1].type, "dropdown");
  assert.equal(imported[1].label, "Country");
  assert.equal(imported[1].options, "USA\nCanada");

  // importing a valid JSON and exporting it again must result in the same structure (excluding regenerated IDs)
  const roundtripExport = exportForm(imported);
  const parsedRoundtrip = JSON.parse(roundtripExport);

  assert.equal(parsedRoundtrip.version, parsed.version);
  assert.equal(parsedRoundtrip.fields.length, parsed.fields.length);
  assert.equal(parsedRoundtrip.fields[0].type, parsed.fields[0].type);
  assert.equal(parsedRoundtrip.fields[0].label, parsed.fields[0].label);
  assert.equal(parsedRoundtrip.fields[0].options, parsed.fields[0].options);
});

test("failure scenario: invalid JSON format", () => {
  assert.throws(() => importForm("invalid { json"), /Invalid JSON format/);
  assert.throws(() => importForm(""), /Invalid JSON format/);
  assert.throws(() => importForm(null), /Invalid input format/);
});

test("failure scenario: unknown version", () => {
  const payload = JSON.stringify({ version: 2, fields: [] });
  assert.throws(() => importForm(payload), /Unknown version/);

  const payloadNoVersion = JSON.stringify({ fields: [] });
  assert.throws(() => importForm(payloadNoVersion), /Unknown version/);
});

test("failure scenario: unknown field types", () => {
  const payload = JSON.stringify({
    version: 1,
    fields: [
      { id: 1, type: "weird-type", label: "Weird" }
    ]
  });
  assert.throws(() => importForm(payload), /Unknown field types/);
});

test("failure scenario: missing field labels", () => {
  const payloadNoLabel = JSON.stringify({
    version: 1,
    fields: [
      { id: 1, type: "text" }
    ]
  });
  assert.throws(() => importForm(payloadNoLabel), /Missing field labels/);

  const payloadEmptyLabel = JSON.stringify({
    version: 1,
    fields: [
      { id: 1, type: "text", label: "   " }
    ]
  });
  assert.throws(() => importForm(payloadEmptyLabel), /Missing field labels/);
});

test("failure scenario: field label >60 characters", () => {
  const longLabel = "a".repeat(61);
  const payload = JSON.stringify({
    version: 1,
    fields: [
      { id: 1, type: "text", label: longLabel }
    ]
  });
  assert.throws(() => importForm(payload), /Field label cannot exceed 60 characters/);
});

test("failure scenario: field-count >50", () => {
  const fields = Array.from({ length: 51 }, (_, i) => ({
    id: i,
    type: "text",
    label: `Field ${i}`
  }));
  const payload = JSON.stringify({
    version: 1,
    fields
  });
  assert.throws(() => importForm(payload), /Form cannot have more than 50 fields/);
});

test("failure scenario: zero options dropdowns", () => {
  const payloadNoOptions = JSON.stringify({
    version: 1,
    fields: [
      { id: 1, type: "dropdown", label: "Select custom", options: "" }
    ]
  });
  assert.throws(() => importForm(payloadNoOptions), /Dropdown fields cannot have zero options/);

  const payloadOnlyWhitespace = JSON.stringify({
    version: 1,
    fields: [
      { id: 1, type: "dropdown", label: "Select custom", options: "   \n\n  " }
    ]
  });
  assert.throws(() => importForm(payloadOnlyWhitespace), /Dropdown fields cannot have zero options/);
});

test("required state: import and export with required states, and fallback when missing", () => {
  // 1. Check export keeps required boolean states
  const fields = [
    { id: 1, type: "text", label: "Field A", required: true },
    { id: 2, type: "checkbox", label: "Field B", required: false },
    { id: 3, type: "email", label: "Field C" } // missing required key, should default to false in export
  ];
  
  const exported = exportForm(fields);
  const parsed = JSON.parse(exported);
  
  assert.equal(parsed.fields[0].required, true);
  assert.equal(parsed.fields[1].required, false);
  assert.equal(parsed.fields[2].required, false);
  
  // 2. Check import preserves/restores required state
  const imported = importForm(exported);
  assert.equal(imported[0].required, true);
  assert.equal(imported[1].required, false);
  assert.equal(imported[2].required, false);
  
  // 3. Check fallback: JSON completely missing 'required' keys defaults to false
  const jsonMissingRequired = JSON.stringify({
    version: 1,
    fields: [
      { id: 10, type: "text", label: "No Required field A" },
      { id: 20, type: "email", label: "No Required field B" }
    ]
  });
  
  const importedMissing = importForm(jsonMissingRequired);
  assert.equal(importedMissing[0].required, false);
  assert.equal(importedMissing[1].required, false);
});
