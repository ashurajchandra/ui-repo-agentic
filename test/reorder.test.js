import assert from "node:assert/strict";
import test from "node:test";
import { reorder } from "../lib/reorder.js";

test("reorder: forward moves", () => {
  const fields = ["a", "b", "c", "d"];
  const result = reorder(fields, 0, 2);
  assert.deepEqual(result, ["b", "c", "a", "d"]);
  // Ensure purity
  assert.deepEqual(fields, ["a", "b", "c", "d"]);
});

test("reorder: backward moves", () => {
  const fields = ["a", "b", "c", "d"];
  const result = reorder(fields, 2, 0);
  assert.deepEqual(result, ["c", "a", "b", "d"]);
  // Ensure purity
  assert.deepEqual(fields, ["a", "b", "c", "d"]);
});

test("reorder: identical positions", () => {
  const fields = ["a", "b", "c", "d"];
  const result = reorder(fields, 2, 2);
  assert.deepEqual(result, ["a", "b", "c", "d"]);
});

test("reorder: out-of-range indexes", () => {
  const fields = ["a", "b", "c", "d"];
  // Negative index
  assert.deepEqual(reorder(fields, -1, 2), ["a", "b", "c", "d"]);
  assert.deepEqual(reorder(fields, 1, -2), ["a", "b", "c", "d"]);
  // Too large index
  assert.deepEqual(reorder(fields, 4, 1), ["a", "b", "c", "d"]);
  assert.deepEqual(reorder(fields, 1, 10), ["a", "b", "c", "d"]);
});
