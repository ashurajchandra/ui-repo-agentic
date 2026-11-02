"use client";

import { useState } from "react";
import {
  sortForms,
  searchForms,
  duplicateForm,
  deleteForm,
} from "../../lib/forms.js";
import {
  addField,
  getEffectiveLabel,
  parseOptions,
  removeField,
  updateField,
  moveField,
} from "../../lib/form-fields.js";
import { exportForm, importForm } from "../../lib/form-json.js";
import { reorder } from "../../lib/reorder.js";

const INITIAL_FORMS = [
  {
    id: "form-1",
    name: "Customer Feedback Form",
    status: "published",
    created: "2023-11-01T10:00:00.000Z",
    lastUpdated: "2023-11-15T14:30:00.000Z",
    responseCount: 12,
    fields: [
      { id: "f1", type: "text", label: "Your Name", options: "" },
      { id: "f2", type: "email", label: "Email Address", options: "" },
    ],
  },
  {
    id: "form-2",
    name: "Newsletter Sign-up",
    status: "draft",
    created: "2023-11-10T09:00:00.000Z",
    lastUpdated: "2023-11-12T11:20:00.000Z",
    responseCount: 0,
    fields: [
      { id: "f3", type: "email", label: "Email Address", options: "" },
    ],
  },
];

export default function BuilderPage() {
  const [forms, setForms] = useState(INITIAL_FORMS);
  const [searchQuery, setSearchQuery] = useState("");
  const [mode, setMode] = useState("list"); // "list" | "edit" | "preview"
  const [activeFormId, setActiveFormId] = useState(null);

  // Form Editor specific state
  const [exportText, setExportText] = useState("");
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [canDrag, setCanDrag] = useState(false);

  // Active form retrieval
  const activeForm = forms.find((f) => f.id === activeFormId);

  // Actions
  function handleCreateForm() {
    const now = new Date().toISOString();
    const newForm = {
      id: `form-${Date.now()}`,
      name: "Untitled Form",
      status: "draft",
      created: now,
      lastUpdated: now,
      responseCount: 0,
      fields: [],
    };
    setForms((current) => [newForm, ...current]);
    setActiveFormId(newForm.id);
    setMode("edit");
  }

  function handleOpenEdit(id) {
    setActiveFormId(id);
    setMode("edit");
    setExportText("");
    setImportText("");
    setImportError("");
  }

  function handleOpenPreview(id) {
    setActiveFormId(id);
    setMode("preview");
  }

  function handleDuplicate(id) {
    setForms((current) => duplicateForm(current, id));
  }

  function handleDelete(id) {
    const confirmed = window.confirm("Are you sure you want to delete this form?");
    if (confirmed) {
      setForms((current) => deleteForm(current, id));
    }
  }

  // Active form field mutations
  function updateActiveForm(updater) {
    setForms((current) =>
      current.map((f) => {
        if (f.id === activeFormId) {
          const updated = updater(f);
          return {
            ...updated,
            lastUpdated: new Date().toISOString(),
          };
        }
        return f;
      })
    );
  }

  function handleAddField(type) {
    updateActiveForm((f) => ({
      ...f,
      fields: addField(f.fields, type),
    }));
  }

  function handleUpdateLabel(id, label) {
    updateActiveForm((f) => ({
      ...f,
      fields: updateField(f.fields, id, { label }),
    }));
  }

  function handleUpdateOptions(id, options) {
    updateActiveForm((f) => ({
      ...f,
      fields: updateField(f.fields, id, { options }),
    }));
  }

  function handleRemoveField(id) {
    updateActiveForm((f) => ({
      ...f,
      fields: removeField(f.fields, id),
    }));
  }

  function handleMoveField(id, direction) {
    updateActiveForm((f) => ({
      ...f,
      fields: moveField(f.fields, id, direction),
    }));
  }

  function handleExport() {
    if (!activeForm) return;
    const output = exportForm(activeForm.fields);
    setExportText(output);
  }

  function handleImport() {
    try {
      const imported = importForm(importText);
      updateActiveForm((f) => ({
        ...f,
        fields: imported,
      }));
      setImportError("");
    } catch (err) {
      setImportError(err.message);
    }
  }

  // HTML5 DnD event handlers
  function handleDragStart(e, index) {
    if (!canDrag) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = "move";
    setDraggedIndex(index);
  }

  function handleDragOver(e, index) {
    e.preventDefault();
    if (draggedIndex === null) return;
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  }

  function handleDragEnd() {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setCanDrag(false);
  }

  function handleDrop(e, index) {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      updateActiveForm((f) => ({
        ...f,
        fields: reorder(f.fields, draggedIndex, index),
      }));
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
    setCanDrag(false);
  }

  // Sort and Search applied on the forms list
  const filteredForms = searchForms(sortForms(forms), searchQuery);

  if (mode === "edit" && activeForm) {
    const fields = activeForm.fields || [];
    return (
      <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <button onClick={() => setMode("list")} style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
            ← Back to Forms List
          </button>
          <h2>Editing: {activeForm.name}</h2>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <label style={{ display: "flex", gap: "5px", alignItems: "center" }}>
              <strong>Form Name:</strong>
              <input
                type="text"
                value={activeForm.name}
                onChange={(e) => updateActiveForm((f) => ({ ...f, name: e.target.value }))}
                style={{ padding: "4px", fontSize: "1rem" }}
              />
            </label>
            <label style={{ display: "flex", gap: "5px", alignItems: "center" }}>
              <strong>Status:</strong>
              <select
                value={activeForm.status}
                onChange={(e) => updateActiveForm((f) => ({ ...f, status: e.target.value }))}
                style={{ padding: "4px" }}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
          </div>
        </div>

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
            <h3>Configuration</h3>
            <div data-testid="field-list" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {fields.map((field, index) => {
                const effectiveLabel = getEffectiveLabel(field.label, field.type);
                const isDragging = draggedIndex === index;
                const isDragOver = dragOverIndex === index && draggedIndex !== index;

                return (
                  <div
                    key={field.id}
                    draggable={canDrag}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, index)}
                    style={{
                      border: isDragOver ? "2px dashed #0070f3" : "1px solid #ccc",
                      backgroundColor: isDragOver ? "#f0f7ff" : "transparent",
                      opacity: isDragging ? 0.5 : 1,
                      boxShadow: isDragging ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                      padding: "1rem",
                      borderRadius: "4px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      width: "100%",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span
                          data-testid="drag-handle"
                          aria-label="Drag to reorder"
                          role="button"
                          tabIndex={0}
                          onMouseDown={() => setCanDrag(true)}
                          onMouseUp={() => setCanDrag(false)}
                          onTouchStart={() => setCanDrag(true)}
                          onTouchEnd={() => setCanDrag(false)}
                          style={{
                            cursor: "grab",
                            userSelect: "none",
                            padding: "4px 8px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            backgroundColor: "#f5f5f5",
                            fontSize: "1.2rem",
                            lineHeight: "1"
                          }}
                        >
                          ☰
                        </span>
                        <span style={{ fontWeight: "bold", textTransform: "capitalize" }}>
                          {field.type} Field
                        </span>
                      </div>
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
            <h3>Live Preview</h3>
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

            {/* Export / Import tools */}
            <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ borderTop: "1px solid #ccc", paddingTop: "1.5rem" }}>
                <h4>Schema Tools</h4>
                <div style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
                  <button onClick={handleExport}>Export Schema</button>
                </div>
                {exportText && (
                  <textarea
                    readOnly
                    data-testid="export-output"
                    value={exportText}
                    style={{ width: "100%", height: "100px", fontFamily: "monospace", padding: "4px" }}
                  />
                )}
              </div>

              <div>
                <h5>Import Schema</h5>
                <textarea
                  data-testid="import-input"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Paste JSON schema here..."
                  style={{ width: "100%", height: "100px", fontFamily: "monospace", padding: "4px", marginBottom: "0.5rem" }}
                />
                <button onClick={handleImport}>Import</button>
                {importError && (
                  <p data-testid="import-error" style={{ color: "red", marginTop: "0.5rem" }}>
                    {importError}
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (mode === "preview" && activeForm) {
    const fields = activeForm.fields || [];
    return (
      <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
        <button onClick={() => setMode("list")} style={{ padding: "0.5rem 1rem", cursor: "pointer", marginBottom: "2rem" }}>
          ← Back to Forms List
        </button>
        <h2>Preview: {activeForm.name}</h2>
        <div
          data-testid="preview-only"
          style={{
            border: "1px solid #ccc",
            padding: "2rem",
            borderRadius: "8px",
            backgroundColor: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          {fields.length === 0 ? (
            <p style={{ color: "#666" }}>This form has no fields yet.</p>
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
      </main>
    );
  }

  // List Mode (Main View)
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>Form Builder</h1>
        {forms.length > 0 && (
          <button
            onClick={handleCreateForm}
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: "bold",
              backgroundColor: "#0070f3",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Create form
          </button>
        )}
      </div>

      {forms.length === 0 ? (
        <div
          data-testid="empty-state"
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            border: "2px dashed #ccc",
            borderRadius: "8px",
            backgroundColor: "#fafafa",
          }}
        >
          <p style={{ fontSize: "1.2rem", color: "#666", marginBottom: "1.5rem" }}>
            No forms exist yet. Create your first form to get started!
          </p>
          <button
            onClick={handleCreateForm}
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "1.1rem",
              fontWeight: "bold",
              backgroundColor: "#0070f3",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Create form
          </button>
        </div>
      ) : (
        <>
          {/* Search bar */}
          <div style={{ marginBottom: "1.5rem" }}>
            <input
              type="text"
              placeholder="Search forms by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                maxWidth: "400px",
                padding: "0.5rem",
                fontSize: "1rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          {/* Forms Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #eaeaea", backgroundColor: "#f9f9f9" }}>
                  <th style={{ padding: "0.75rem" }}>Form Name</th>
                  <th style={{ padding: "0.75rem" }}>Status</th>
                  <th style={{ padding: "0.75rem" }}>Created Date</th>
                  <th style={{ padding: "0.75rem" }}>Last Updated</th>
                  <th style={{ padding: "0.75rem" }}>Response Count</th>
                  <th style={{ padding: "0.75rem", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredForms.map((form) => (
                  <tr key={form.id} style={{ borderBottom: "1px solid #eaeaea" }}>
                    <td style={{ padding: "0.75rem", fontWeight: "600" }}>{form.name}</td>
                    <td style={{ padding: "0.75rem", textTransform: "capitalize" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.85rem",
                          backgroundColor: form.status === "published" ? "#e6fffa" : "#f7fafc",
                          color: form.status === "published" ? "#319795" : "#4a5568",
                          border: `1px solid ${form.status === "published" ? "#b2f5ea" : "#e2e8f0"}`,
                        }}
                      >
                        {form.status}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      {new Date(form.created).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      {new Date(form.lastUpdated).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "0.75rem" }}>{form.responseCount}</td>
                    <td style={{ padding: "0.75rem", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => handleOpenEdit(form.id)}
                          style={{
                            padding: "0.4rem 0.8rem",
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            backgroundColor: "#fff",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                          }}
                        >
                          Open/Edit
                        </button>
                        <button
                          onClick={() => handleOpenPreview(form.id)}
                          style={{
                            padding: "0.4rem 0.8rem",
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            backgroundColor: "#fff",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                          }}
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => handleDuplicate(form.id)}
                          style={{
                            padding: "0.4rem 0.8rem",
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            backgroundColor: "#fff",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                          }}
                        >
                          Duplicate
                        </button>
                        <button
                          onClick={() => handleDelete(form.id)}
                          style={{
                            padding: "0.4rem 0.8rem",
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            backgroundColor: "#fff",
                            color: "red",
                            border: "1px solid red",
                            borderRadius: "4px",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredForms.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
                      No forms matched your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
