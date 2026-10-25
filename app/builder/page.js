"use client";

import { useState } from "react";
import {
  addField,
  getEffectiveLabel,
  parseOptions,
  removeField,
  updateField,
  moveField,
} from "../../lib/form-fields.js";

export default function BuilderPage() {
  const [fields, setFields] = useState([]);

  function handleAddField(type) {
    setFields((current) => addField(current, type));
  }

  function handleUpdateLabel(id, label) {
    setFields((current) => updateField(current, id, { label }));
  }

  function handleUpdateOptions(id, options) {
    setFields((current) => updateField(current, id, { options }));
  }

  function handleRemoveField(id) {
    setFields((current) => removeField(current, id));
  }

  function handleMoveField(id, direction) {
    setFields((current) => moveField(current, id, direction));
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Form Builder</h1>
      
      {/* Toolbar */}
      <section style={{ marginBottom: "2rem", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button data-testid="add-text" onClick={() => handleAddField("text")}>
          Add text
        </button>
        <button data-testid="add-email" onClick={() => handleAddField("email")}>
          Add email
        </button>
        <button data-testid="add-checkbox" onClick={() => handleAddField("checkbox")}>
          Add checkbox
        </button>
        <button data-testid="add-dropdown" onClick={() => handleAddField("dropdown")}>
          Add dropdown
        </button>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        {/* Configuration Panel */}
        <section>
          <h2>Configuration</h2>
          <div data-testid="field-list" style={{ display: "flex", flexDirection: "col", gap: "1.5rem" }}>
            {fields.map((field, index) => {
              const effectiveLabel = getEffectiveLabel(field.label, field.type);
              return (
                <div
                  key={field.id}
                  style={{
                    border: "1px solid #ccc",
                    padding: "1rem",
                    borderRadius: "4px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    width: "100%",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "bold", textTransform: "capitalize" }}>
                      {field.type} Field
                    </span>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        data-testid="move-up"
                        disabled={index === 0}
                        aria-label={`Move ${effectiveLabel} up`}
                        onClick={() => handleMoveField(field.id, "up")}
                      >
                        Move up
                      </button>
                      <button
                        data-testid="move-down"
                        disabled={index === fields.length - 1}
                        aria-label={`Move ${effectiveLabel} down`}
                        onClick={() => handleMoveField(field.id, "down")}
                      >
                        Move down
                      </button>
                      <button
                        data-testid="remove-field"
                        onClick={() => handleRemoveField(field.id)}
                        style={{ color: "red" }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <span>Field Label:</span>
                    <input
                      type="text"
                      data-testid="field-label"
                      value={field.label}
                      maxLength={60}
                      onChange={(e) => handleUpdateLabel(field.id, e.target.value)}
                      style={{ padding: "4px", width: "100%" }}
                    />
                  </label>

                  {field.type === "dropdown" && (
                    <label style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span>Dropdown Options (one per line):</span>
                      <textarea
                        rows={4}
                        value={field.options}
                        onChange={(e) => handleUpdateOptions(field.id, e.target.value)}
                        placeholder="Option 1&#10;Option 2"
                        style={{ padding: "4px", width: "100%" }}
                      />
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Live Preview Section */}
        <section>
          <h2>Live Preview</h2>
          <div
            data-testid="preview"
            style={{
              border: "2px dashed #999",
              padding: "2rem",
              borderRadius: "8px",
              minHeight: "200px",
            }}
          >
            {fields.length === 0 ? (
              <p>No fields yet</p>
            ) : (
              <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {fields.map((field) => {
                  const effectiveLabel = getEffectiveLabel(field.label, field.type);
                  
                  return (
                    <div key={field.id} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {field.type === "checkbox" ? (
                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <input type="checkbox" />
                          <span>{effectiveLabel}</span>
                        </label>
                      ) : (
                        <>
                          <label style={{ fontWeight: "600" }}>{effectiveLabel}</label>
                          {field.type === "text" && (
                            <input type="text" style={{ padding: "6px", width: "100%" }} />
                          )}
                          {field.type === "email" && (
                            <input type="email" style={{ padding: "6px", width: "100%" }} />
                          )}
                          {field.type === "dropdown" && (
                            <select style={{ padding: "6px", width: "100%" }}>
                              {parseOptions(field.options).map((opt, idx) => (
                                <option key={idx} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
