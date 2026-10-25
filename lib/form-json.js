import { parseOptions } from "./form-fields.js";

export function exportForm(fields) {
  const safeFields = Array.isArray(fields) ? fields : [];
  return JSON.stringify({
    version: 1,
    fields: safeFields.map(f => ({
      id: f.id,
      type: f.type,
      label: f.label,
      options: f.options ?? ""
    }))
  }, null, 2);
}

export function importForm(text) {
  if (typeof text !== "string") {
    throw new Error("Invalid input format");
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch (err) {
    throw new Error("Invalid JSON format");
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Invalid JSON format");
  }

  if (data.version === undefined) {
    throw new Error("Unknown version");
  }

  if (data.version !== 1) {
    throw new Error("Unknown version");
  }

  if (!Array.isArray(data.fields)) {
    throw new Error("Invalid fields structure");
  }

  if (data.fields.length > 50) {
    throw new Error("Form cannot have more than 50 fields");
  }

  const validTypes = ["text", "email", "checkbox", "dropdown"];

  const processedFields = [];
  let idCounter = 1;

  for (const f of data.fields) {
    if (!f || typeof f !== "object" || Array.isArray(f)) {
      throw new Error("Invalid field structure");
    }

    if (f.type === undefined || !validTypes.includes(f.type)) {
      throw new Error("Unknown field types");
    }

    if (f.label === undefined || f.label === null || typeof f.label !== "string" || f.label.trim() === "") {
      throw new Error("Missing field labels");
    }

    if (f.label.length > 60) {
      throw new Error("Field label cannot exceed 60 characters");
    }

    let optionsStr = "";
    if (typeof f.options === "string") {
      optionsStr = f.options;
    } else if (Array.isArray(f.options)) {
      optionsStr = f.options.join("\n");
    }

    if (f.type === "dropdown") {
      const parsed = parseOptions(optionsStr);
      if (parsed.length === 0) {
        throw new Error("Dropdown fields cannot have zero options");
      }
    }

    processedFields.push({
      id: idCounter++,
      type: f.type,
      label: f.label,
      options: optionsStr
    });
  }

  return processedFields;
}
