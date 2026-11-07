"use client";

import { useState, useEffect, useRef } from "react";
import { addTodo, remaining, removeTodo, toggleTodo, moveTodo } from "../lib/todos.js";
import { exportTodos, parseAndValidateImport, importTodos } from "../lib/todo-transfer.js";

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [loaded, setLoaded] = useState(false);

  // Dialog & copy state
  const [exportCopied, setExportCopied] = useState(false);
  const [importText, setImportText] = useState("");
  const [previewResult, setPreviewResult] = useState(null); // null, { valid: true, todos: [...] }, or { valid: false, error: "..." }
  const [importStatus, setImportStatus] = useState(""); // "Added [x], skipped [y] already in your list"

  // Move tracking state for focus retention
  const [lastMoved, setLastMoved] = useState(null); // { id, direction, timestamp }

  // Refs
  const exportButtonRef = useRef(null);
  const importButtonRef = useRef(null);
  const exportDialogRef = useRef(null);
  const importDialogRef = useRef(null);
  const copyTimeoutRef = useRef(null);

  // Load from localStorage safely
  useEffect(() => {
    try {
      const saved = localStorage.getItem("todos");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const validated = parsed.filter(
            (t) =>
              t &&
              typeof t === "object" &&
              typeof t.id === "number" &&
              typeof t.title === "string"
          );
          setTodos(validated);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoaded(true);
  }, []);

  // Sync to localStorage
  const updateTodos = (next) => {
    setTodos(next);
    try {
      localStorage.setItem("todos", JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }
  };

  // Focus retention for move buttons
  useEffect(() => {
    if (!lastMoved) return;
    const { id, direction } = lastMoved;
    const index = todos.findIndex((t) => t.id === id);
    if (index === -1) return;

    let buttonToFocus = null;
    if (direction === "up") {
      if (index === 0) {
        // opposite button
        buttonToFocus = document.getElementById(`move-down-${id}`);
      } else {
        buttonToFocus = document.getElementById(`move-up-${id}`);
      }
    } else if (direction === "down") {
      if (index === todos.length - 1) {
        // opposite button
        buttonToFocus = document.getElementById(`move-up-${id}`);
      } else {
        buttonToFocus = document.getElementById(`move-down-${id}`);
      }
    }

    if (buttonToFocus) {
      buttonToFocus.focus();
    }
  }, [todos, lastMoved]);

  function submit(event) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    const next = addTodo(todos, cleanTitle);
    updateTodos(next);
    setTitle("");
  }

  // Export Dialog handlers
  const openExportDialog = () => {
    setExportCopied(false);
    exportDialogRef.current?.showModal();
  };

  const closeExportDialog = () => {
    exportDialogRef.current?.close();
    exportButtonRef.current?.focus();
  };

  const handleCopyExport = () => {
    const jsonStr = JSON.stringify(exportTodos(todos), null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      setExportCopied(true);
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => {
        setExportCopied(false);
      }, 3000);
    });
  };

  // Import Dialog handlers
  const openImportDialog = () => {
    setImportText("");
    setPreviewResult(null);
    setImportStatus("");
    importDialogRef.current?.showModal();
  };

  const closeImportDialog = () => {
    importDialogRef.current?.close();
    importButtonRef.current?.focus();
  };

  const handlePreview = () => {
    const result = parseAndValidateImport(importText);
    setPreviewResult(result);
    setImportStatus("");
  };

  const handleAddTodos = () => {
    if (!previewResult || !previewResult.valid) return;
    const { todos: updated, added, skipped } = importTodos(todos, previewResult.todos);
    updateTodos(updated);
    setImportStatus(`Added ${added}, skipped ${skipped} already in your list`);
    // Clear preview but keep state so they can close
    setPreviewResult(null);
    setImportText("");
  };

  const handleMove = (id, direction) => {
    const next = moveTodo(todos, id, direction);
    updateTodos(next);
    setLastMoved({ id, direction, timestamp: Date.now() });
  };

  return (
    <section>
      <div className="transfer-buttons">
        <button
          ref={exportButtonRef}
          type="button"
          aria-label="Export todos"
          onClick={openExportDialog}
        >
          Export todos
        </button>
        <button
          ref={importButtonRef}
          type="button"
          aria-label="Import todos"
          onClick={openImportDialog}
        >
          Import todos
        </button>
      </div>

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

      {todos.length === 0 ? (
        <p className="empty" data-testid="empty">
          Nothing to do yet.
        </p>
      ) : (
        <ul data-testid="todo-list">
          {todos.map((todo, index) => (
            <li key={todo.id} className={todo.done ? "done" : ""}>
              <label>
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => updateTodos(toggleTodo(todos, todo.id))}
                />{" "}
                <span>{todo.title}</span>
              </label>
              <button
                id={`move-up-${todo.id}`}
                type="button"
                className="move-btn"
                aria-label={`Move ${todo.title} up`}
                disabled={index === 0}
                onClick={() => handleMove(todo.id, "up")}
              >
                Move up
              </button>
              <button
                id={`move-down-${todo.id}`}
                type="button"
                className="move-btn"
                aria-label={`Move ${todo.title} down`}
                disabled={index === todos.length - 1}
                onClick={() => handleMove(todo.id, "down")}
              >
                Move down
              </button>
              <button
                type="button"
                className="link"
                onClick={() => updateTodos(removeTodo(todos, todo.id))}
                aria-label={`Remove ${todo.title}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="muted" data-testid="count">
        {remaining(todos)} left
      </p>

      {/* Export Dialog */}
      <dialog
        ref={exportDialogRef}
        onClose={() => exportButtonRef.current?.focus()}
      >
        <label htmlFor="export-textarea">Your todos as JSON</label>
        <textarea
          id="export-textarea"
          readOnly
          value={JSON.stringify(exportTodos(todos), null, 2)}
        />
        <div className="dialog-actions">
          {exportCopied && <span className="copy-feedback">Copied</span>}
          <button type="button" onClick={handleCopyExport}>
            Copy
          </button>
          <button type="button" className="link" onClick={closeExportDialog}>
            Close
          </button>
        </div>
      </dialog>

      {/* Import Dialog */}
      <dialog
        ref={importDialogRef}
        onClose={() => importButtonRef.current?.focus()}
      >
        <label htmlFor="import-textarea">Paste todos as JSON</label>
        <textarea
          id="import-textarea"
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder="[{'title': '...', 'done': false}]"
        />
        {previewResult && previewResult.valid && (
          <div>
            <p className="success-msg">
              {previewResult.todos.length} todos will be added
            </p>
            <ul className="preview-list">
              {previewResult.todos.slice(0, 5).map((t, idx) => (
                <li key={idx}>{t.title}</li>
              ))}
            </ul>
          </div>
        )}
        {previewResult && !previewResult.valid && (
          <p className="error-msg">This is not a list of todos</p>
        )}
        {importStatus && <p className="success-msg">{importStatus}</p>}
        <div className="dialog-actions">
          <button type="button" onClick={handlePreview}>
            Preview
          </button>
          <button
            type="button"
            disabled={!previewResult || !previewResult.valid}
            onClick={handleAddTodos}
          >
            Add todos
          </button>
          <button type="button" className="link" onClick={closeImportDialog}>
            Cancel
          </button>
        </div>
      </dialog>
    </section>
  );
}
