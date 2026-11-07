"use client";

import { useState, useEffect, useRef } from "react";

import {
  addTodo,
  remaining,
  removeTodo,
  toggleTodo,
  sanitizeSavedTodos,
  validateImportJSON,
  importTodos,
  moveTodo,
} from "../lib/todos.js";

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [title, setTitle] = useState("");

  // Dialog States
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [validationError, setValidationError] = useState("");
  const [previewedItems, setPreviewedItems] = useState(null);
  const [importResult, setImportResult] = useState("");

  // Refs
  const exportBtnRef = useRef(null);
  const importBtnRef = useRef(null);
  const exportDialogRef = useRef(null);
  const importDialogRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("todos");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const validated = sanitizeSavedTodos(parsed);
          setTodos(validated);
        }
      } catch (e) {
        // ignore
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("todos", JSON.stringify(todos));
    }
  }, [todos, isLoaded]);

  function submit(event) {
    event.preventDefault();
    setTodos((current) => addTodo(current, title));
    setTitle("");
  }

  const handleCopy = () => {
    const exportData = todos.map(({ title, done }) => ({ title, done }));
    const jsonText = JSON.stringify(exportData, null, 2);
    navigator.clipboard.writeText(jsonText).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    }).catch(() => {
      // ignore
    });
  };

  const handlePreview = () => {
    setValidationError("");
    setPreviewedItems(null);
    setImportResult("");
    const validated = validateImportJSON(importText);
    if (!validated) {
      setValidationError("This is not a list of todos");
    } else {
      setPreviewedItems(validated);
    }
  };

  const handleImport = () => {
    if (!previewedItems) return;
    const result = importTodos(todos, previewedItems);
    setTodos(result.todos);
    setImportResult(`Added ${result.added}, skipped ${result.skipped} already in your list`);
    setPreviewedItems(null);
    setImportText("");
  };

  return (
    <section>
      <form onSubmit={submit}>
        <input
          id="new-todo"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs doing?"
          aria-label="New todo"
        />
        <button type="submit">Add</button>
      </form>

      <div className="toolbar" style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button
          type="button"
          ref={exportBtnRef}
          aria-label="Export todos"
          onClick={() => {
            setIsExportOpen(true);
            exportDialogRef.current?.showModal();
          }}
        >
          Export
        </button>
        <button
          type="button"
          ref={importBtnRef}
          aria-label="Import todos"
          onClick={() => {
            setIsImportOpen(true);
            importDialogRef.current?.showModal();
          }}
        >
          Import
        </button>
      </div>

      {todos.length === 0 ? (
        <p className="empty" data-testid="empty">Nothing to do yet.</p>
      ) : (
        <ul data-testid="todo-list">
          {todos.map((todo, idx) => (
            <li key={todo.id} className={todo.done ? "done" : ""}>
              <label>
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => setTodos((current) => toggleTodo(current, todo.id))}
                />{" "}
                <span>{todo.title}</span>
              </label>

              <button
                type="button"
                className="link reorder-btn"
                disabled={idx === 0}
                onClick={(e) => {
                  setTodos((current) => moveTodo(current, todo.id, "up"));
                  setTimeout(() => e.target.focus(), 0);
                }}
                aria-label={`Move ${todo.title} up`}
              >
                Move up
              </button>

              <button
                type="button"
                className="link reorder-btn"
                disabled={idx === todos.length - 1}
                onClick={(e) => {
                  setTodos((current) => moveTodo(current, todo.id, "down"));
                  setTimeout(() => e.target.focus(), 0);
                }}
                aria-label={`Move ${todo.title} down`}
              >
                Move down
              </button>

              <button
                type="button"
                className="link"
                onClick={() => setTodos((current) => removeTodo(current, todo.id))}
                aria-label={`Remove ${todo.title}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="muted" data-testid="count">{remaining(todos)} left</p>

      {/* Export Dialog */}
      <dialog
        ref={exportDialogRef}
        onClose={() => {
          setIsExportOpen(false);
          exportBtnRef.current?.focus();
        }}
        className="todo-dialog"
      >
        <div className="dialog-content">
          <h3>Export todos</h3>
          <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
            <label htmlFor="export-text">Your todos as JSON</label>
            <textarea
              id="export-text"
              readOnly
              rows={8}
              value={JSON.stringify(todos.map(({ title, done }) => ({ title, done })), null, 2)}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid var(--line)" }}
            />
          </div>
          <div className="dialog-actions" style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <button type="button" onClick={handleCopy}>
              {copied ? "Copied" : "Copy"}
            </button>
            <button type="button" onClick={() => exportDialogRef.current?.close()} style={{ background: "var(--muted)" }}>
              Close
            </button>
          </div>
        </div>
      </dialog>

      {/* Import Dialog */}
      <dialog
        ref={importDialogRef}
        onClose={() => {
          setIsImportOpen(false);
          setImportText("");
          setValidationError("");
          setPreviewedItems(null);
          setImportResult("");
          importBtnRef.current?.focus();
        }}
        className="todo-dialog"
      >
        <div className="dialog-content">
          <h3>Import todos</h3>
          <div className="form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
            <label htmlFor="import-text">Paste todos as JSON</label>
            <textarea
              id="import-text"
              rows={8}
              value={importText}
              onChange={(e) => {
                setImportText(e.target.value);
                setValidationError("");
                setPreviewedItems(null);
                setImportResult("");
              }}
              placeholder='[{"title": "example", "done": false}]'
              style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid var(--line)" }}
            />
          </div>

          {validationError && (
            <p className="error-message" role="alert" style={{ color: "red", marginBottom: "1rem" }}>
              {validationError}
            </p>
          )}

          {previewedItems && (
            <div className="preview-section" style={{ marginBottom: "1rem" }}>
              <strong style={{ display: "block", marginBottom: "0.5rem" }}>
                {previewedItems.length} todos will be added
              </strong>
              <ul style={{ background: "var(--bg)", border: "1px solid var(--line)", padding: "0.5rem 1rem", borderRadius: "8px" }}>
                {previewedItems.slice(0, 5).map((item, idx) => (
                  <li key={idx} style={{ borderBottom: idx === Math.min(previewedItems.length, 5) - 1 ? 0 : "1px solid var(--line)", padding: "0.25rem 0" }}>
                    {item.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {importResult && (
            <p className="success-message" role="status" style={{ color: "green", marginBottom: "1rem" }}>
              {importResult}
            </p>
          )}

          <div className="dialog-actions" style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <button type="button" onClick={handlePreview}>
              Preview
            </button>
            <button
              type="button"
              disabled={!previewedItems || !!importResult}
              onClick={handleImport}
              style={{ opacity: (!previewedItems || !!importResult) ? 0.6 : 1 }}
            >
              Add todos
            </button>
            <button type="button" onClick={() => importDialogRef.current?.close()} style={{ background: "var(--muted)" }}>
              Cancel
            </button>
          </div>
        </div>
      </dialog>
    </section>
  );
}
