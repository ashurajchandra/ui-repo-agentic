import { reorder } from "./reorder.js";

export function getDefaultLabel(type) {
  switch (type) {
    case "text":
      return "Untitled text";
    case "email":
      return "Untitled email";
    case "checkbox":
      return "Untitled checkbox";
    case "dropdown":
      return "Untitled dropdown";
    default:
      return "Untitled field";
  }
}

export function getEffectiveLabel(label, type) {
  if (label === undefined || label === null || String(label).trim() === "") {
    return getDefaultLabel(type);
  }
  return String(label).slice(0, 60);
}

export function parseOptions(optionsRaw) {
  if (typeof optionsRaw !== "string") {
    return [];
  }
  return optionsRaw
    .split("\n")
    .map((opt) => opt.trim())
    .filter((opt) => opt !== "");
}

export function addField(fields, type) {
  const nextId = (fields ?? []).reduce((highest, f) => Math.max(highest, f.id), 0) + 1;
  const newField = {
    id: nextId,
    type,
    label: getDefaultLabel(type),
    options: "",
    required: false,
  };
  return [...(fields ?? []), newField];
}

export function removeField(fields, id) {
  return (fields ?? []).filter((f) => f.id !== id);
}

export function updateField(fields, id, updates) {
  return (fields ?? []).map((f) => (f.id === id ? { ...f, ...updates } : f));
}

export function moveField(fields, id, direction) {
  const safeFields = fields ?? [];
  const index = safeFields.findIndex((f) => f.id === id);
  if (index === -1) {
    return safeFields;
  }
  if (direction === "up") {
    if (index === 0) {
      return safeFields;
    }
    return reorder(safeFields, index, index - 1);
  }
  if (direction === "down") {
    if (index === safeFields.length - 1) {
      return safeFields;
    }
    return reorder(safeFields, index, index + 1);
  }
  return safeFields;
}

export function duplicateField(fields, id) {
  const safeFields = fields ?? [];
  const index = safeFields.findIndex((f) => f.id === id);
  if (index === -1) {
    return safeFields;
  }
  const original = safeFields[index];
  const nextId = safeFields.reduce((highest, f) => Math.max(highest, f.id), 0) + 1;
  
  const duplicated = structuredClone(original);
  duplicated.id = nextId;

  const existingLabels = new Set(safeFields.map((f) => f.label));
  let candidateLabel = `${original.label} (copy)`;
  let counter = 2;
  while (existingLabels.has(candidateLabel)) {
    candidateLabel = `${original.label} (copy ${counter})`;
    counter++;
  }
  duplicated.label = candidateLabel;

  const result = [...safeFields];
  result.splice(index + 1, 0, duplicated);
  return result;
}
