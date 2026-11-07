"use client";

import { useState, useEffect, useRef } from "react";

import {
  addTodo,
  remaining,
  removeTodo,
  toggleTodo,
  moveTodo,
  exportTodos,
  validateImportJSON,
  importTodos
} from "../lib/todos.js";

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [lastMoved, setLastMoved] = useState(null);

  // Modal states
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  // Copy success state
  const [showCopied, setShowCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  // Import states
  const [importText, setImportText] = useState("");
  const [previewData, setPreviewData] = useState(null);
  const [previewError, setPreviewError] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Refs for focus return
  const exportBtnRef = useRef(null);
  const importBtnRef = useRef(null);
  const isFirstRender = useRef(true);

  // LocalStorage persistence and sanitization
  useEffect(() => {
    const saved = localStorage.getItem("todos");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const validated = parsed.filter(
            (t) => t && typeof t.id === "number" && typeof t.title === "string"
          );
          setTodos(validated);
        }
      } catch (e) {
        // Safe to ignore malformed content
      }
    }
    isFirstRender.current = false;
  }, []);

  useEffect(() => {
    if (isFirstRender.current) return;
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // Handle focus return on move up/down
  useEffect(() => {
    if (!lastMoved) return;
    const { id, direction } = lastMoved;
    let buttonId = `move-${id}-${direction}`;
    let element = document.getElementById(buttonId);
    if (element && element.disabled) {
      // If the clicked button is now disabled, focus the sibling move button of the same item
      const otherDirection = direction === "up" ? "down" : "up";
      const siblingId = `move-${id}-${otherDirection}`;
      const siblingElement = document.getElementById(siblingId);
      if (siblingElement) {
        siblingElement.focus();
      }
    } else if (element) {
      element.focus();
    }
    setLastMoved(null);
  }, [todos, lastMoved]);

  // Clean up copy timeout
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  // Keyboard Escape and focus trap listeners
  useEffect(() => {
    if (!exportOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setExportOpen(false);
        exportBtnRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [exportOpen]);

  useEffect(() => {
    if (!importOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeImportModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [importOpen]);

  function submit(event) {
    event.preventDefault();
    setTodos((current) => addTodo(current, title));
    setTitle("");
  }

  function handleMove(id, direction) {
    setTodos((current) => moveTodo(current, id, direction));
    setLastMoved({ id, direction });
  }

  function openExportModal() {
    setExportOpen(true);
    setShowCopied(false);
  }

  function closeExportModal() {
    setExportOpen(false);
    exportBtnRef.current?.focus();
  }

  function handleCopy() {
    const text = exportTodos(todos);
    navigator.clipboard.writeText(text).then(() => {
      setShowCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => {
        setShowCopied(false);
      }, 3000);
    });
  }

  function openImportModal() {
    setImportOpen(true);
    setImportText("");
    setPreviewData(null);
    setPreviewError(false);
    setImportResult(null);
  }

  function closeImportModal() {
    setImportOpen(false);
    setImportText("");
    setPreviewData(null);
    setPreviewError(false);
    setImportResult(null);
    importBtnRef.current?.focus();
  }

  function handlePreview() {
    const validated = validateImportJSON(importText);
    if (validated) {
      setPreviewData(validated);
      setPreviewError(false);
    } else {
      setPreviewData(null);
      setPreviewError(true);
    }
    setImportResult(null);
  }

  function handleAddImported() {
    if (!previewData) return;
    const result = importTodos(todos, previewData);
    setTodos(result.todos);
    setImportResult({ added: result.added, skipped: result.skipped });
    setPreviewData(null); // Clear preview to disable Add button
  }

  // Simple focus trap on keydown
  function handleFocusTrap(e, dialogId) {
    if (e.key !== "Tab") return;
    const dialog = document.getElementById(dialogId);
    if (!dialog) return;
    const focusables = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  }

  const exportText = exportTodos(todos);

  return (
    <section className="todo-container">
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

      <div className="todo-controls">
        <button
          type="button"
          ref={exportBtnRef}
          onClick={openExportModal}
          aria-label="Export todos"
        >
          Export todos
        </button>
        <button
          type="button"
          ref={importBtnRef}
          onClick={openImportModal}
          aria-label="Import todos"
        >
          Import todos
        </button>
      </div>

      {todos.length === 0 ? (
        <p className="empty" data-testid="empty">
          Nothing to do yet.
        </p>
      ) : (
        <ul data-testid="todo-list">
          {todos.map((todo, index) => (
            <li key={todo.id} className={todo.done ? "done" : ""}>
              <div className="todo-item-left">
                <input
                  type="checkbox"
                  id={`todo-check-${todo.id}`}
                  checked={todo.done}
                  onChange={() => setTodos((current) => toggleTodo(current, todo.id))}
                />
                <label htmlFor={`todo-check-${todo.id}`}>
                  <span>{todo.title}</span>
                </label>
              </div>
              <div className="todo-item-actions">
                <button
                  type="button"
                  id={`move-${todo.id}-up`}
                  disabled={index === 0}
                  onClick={() => handleMove(todo.id, "up")}
                  aria-label={`Move ${todo.title} up`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  id={`move-${todo.id}-down`}
                  disabled={index === todos.length - 1}
                  onClick={() => handleMove(todo.id, "down")}
                  aria-label={`Move ${todo.title} down`}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="link"
                  onClick={() => setTodos((current) => removeTodo(current, todo.id))}
                  aria-label={`Remove ${todo.title}`}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="muted" data-testid="count">
        {remaining(todos)} left
      </p>

      {/* Export Dialog */}
      {exportOpen && (
        <div
          className="modal-overlay"
          id="export-dialog"
          role="dialog"
          aria-modal="true"
          onKeyDown={(e) => handleFocusTrap(e, "export-dialog")}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h2>Export todos</h2>
            </div>
            <div className="modal-body">
              <label htmlFor="export-json">Your todos as JSON</label>
              <textarea
                id="export-json"
                readOnly
                value={exportText}
              />
            </div>
            <div className="modal-footer">
              <button type="button" onClick={handleCopy}>
                Copy
              </button>
              {showCopied && <span style={{ marginLeft: "8px", fontWeight: "bold" }}>Copied</span>}
              <button
                type="button"
                onClick={closeExportModal}
                style={{ marginLeft: "auto" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Dialog */}
      {importOpen && (
        <div
          className="modal-overlay"
          id="import-dialog"
          role="dialog"
          aria-modal="true"
          onKeyDown={(e) => handleFocusTrap(e, "import-dialog")}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h2>Import todos</h2>
            </div>
            <div className="modal-body">
              <label htmlFor="import-json">Paste todos as JSON</label>
              <textarea
                id="import-json"
                value={importText}
                onChange={(e) => {
                  setImportText(e.target.value);
                  setPreviewData(null);
                  setPreviewError(false);
                  setImportResult(null);
                }}
                placeholder='[{"title": "Buy milk", "done": false}]'
              />

              {previewError && (
                <p className="status-msg error">This is not a list of todos</p>
              )}

              {previewData && (
                <div className="preview-box">
                  <p className="status-msg success">
                    {previewData.length} todos will be added
                  </p>
                  <ul>
                    {previewData.slice(0, 5).map((item, idx) => (
                      <li key={idx}>{item.title}</li>
                    ))}
                  </ul>
                </div>
              )}

              {importResult && (
                <p className="status-msg success">
                  Added {importResult.added}, skipped {importResult.skipped} already in your list
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" onClick={handlePreview}>
                Preview
              </button>
              <button
                type="button"
                onClick={handleAddImported}
                disabled={!previewData}
              >
                Add todos
              </button>
              <button
                type="button"
                onClick={closeImportModal}
                style={{ marginLeft: "auto" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
