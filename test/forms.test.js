import assert from "node:assert/strict";
import test from "node:test";
import {
  sortForms,
  searchForms,
  duplicateForm,
  deleteForm,
} from "../lib/forms.js";

test("sortForms sorts forms by lastUpdated newest first", () => {
  const forms = [
    { id: "1", name: "Form A", lastUpdated: "2023-01-01T10:00:00.000Z" },
    { id: "2", name: "Form B", lastUpdated: "2023-01-03T12:00:00.000Z" },
    { id: "3", name: "Form C", lastUpdated: "2023-01-02T15:00:00.000Z" },
  ];

  const sorted = sortForms(forms);
  assert.equal(sorted[0].id, "2");
  assert.equal(sorted[1].id, "3");
  assert.equal(sorted[2].id, "1");
});

test("searchForms filters forms case-insensitively and handles spaces", () => {
  const forms = [
    { id: "1", name: "Feedback Form" },
    { id: "2", name: "Contact Us" },
    { id: "3", name: "Job Application" },
  ];

  const filtered1 = searchForms(forms, "feedback");
  assert.equal(filtered1.length, 1);
  assert.equal(filtered1[0].id, "1");

  const filtered2 = searchForms(forms, "  Us ");
  assert.equal(filtered2.length, 1);
  assert.equal(filtered2[0].id, "2");

  const filteredEmpty = searchForms(forms, "");
  assert.equal(filteredEmpty.length, 3);
});

test("duplicateForm creates duplicate with standard name append and new ID", () => {
  const forms = [
    { id: "1", name: "Feedback", fields: [1, 2, 3], responseCount: 5 },
  ];

  const duplicated = duplicateForm(forms, "1");
  assert.equal(duplicated.length, 2);
  assert.equal(duplicated[0].id, "1");
  assert.equal(duplicated[1].name, "Feedback (Copy)");
  assert.equal(duplicated[1].responseCount, 0);
  assert.notEqual(duplicated[1].id, "1");
});

test("deleteForm removes form by ID", () => {
  const forms = [
    { id: "1", name: "Feedback" },
    { id: "2", name: "Contact" },
  ];

  const afterDelete = deleteForm(forms, "1");
  assert.equal(afterDelete.length, 1);
  assert.equal(afterDelete[0].id, "2");
});
