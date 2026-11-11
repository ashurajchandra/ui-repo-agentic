"use client";

import { useState, useEffect, useRef } from "react";

import {
  addTodo,
  remaining,
  removeTodo,
  toggleTodo,
  exportTodos,
  validateTodosJSON,
  addImportedTodos,
  moveTodo,
} from "../lib/todos.js";

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [title, setTitle] = useState("");

  // Export State
  const [exportJSON, setExportJSON] = useState("[]");
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  // Import State
  const [importText, setImportText] = useState("");
  const [validationResult, setValidationResult] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  // Refs for Dialogs & Triggers
  const exportDialogRef = useRef(null);
  const exportTriggerRef = useRef(null);
  const importDialogRef = useRef(null);
  const importTriggerRef = useRef(null);

  // Native event listeners for dialog closure focus restoration
  useEffect(() => {
    const exportDlg = exportDialogRef.current;
    const handleClose = () => {
      exportTriggerRef.current?.focus();
    };
    exportDlg?.addEventListener("close", handleClose);
    return () => {
      exportDlg?.removeEventListener("close", handleClose);
    };
  }, []);

  useEffect(() => {
    const importDlg = importDialogRef.current;
    const handleClose = () => {
      importTriggerRef.current?.focus();
    };
    importDlg?.addEventListener("close", handleClose);
    return () => {
      importDlg?.removeEventListener("close", handleClose);
    };
  }, []);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("todos_list");
    if (saved) {
      try {
        setTodos(JSON.parse(saved));
      } catch (e) {
        // ignore bad data
      }
    }
    setHasLoaded(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (hasLoaded) {
      localStorage.setItem("todos_list", JSON.stringify(todos));
    }
  }, [todos, hasLoaded]);

  // Clean copy timeout
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  function submit(event) {
    event.preventDefault();
    setTodos((current) => addTodo(current, title));
    setTitle("");
    setStatusMessage("");
  }

  function handleExportOpen() {
    const json = exportTodos(todos);
    setExportJSON(json);
    setCopied(false);
    exportDialogRef.current?.showModal();
  }

  function handleExportClose() {
    exportDialogRef.current?.close();
  }

  function handleCopy() {
    navigator.clipboard.writeText(exportJSON).then(() => {
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 3000);
    });
  }

  function handleImportOpen() {
    setImportText("");
    setValidationResult(null);
    importDialogRef.current?.showModal();
  }

  function handleImportClose() {
    importDialogRef.current?.close();
  }

  function handlePreview() {
    const res = validateTodosJSON(importText);
    setValidationResult(res);
  }

  function handleAddImported() {
    if (validationResult && validationResult.valid) {
      const res = addImportedTodos(todos, validationResult.todos);
      setTodos(res.todos);
      setStatusMessage(res.message);
      importDialogRef.current?.close();
    }
  }

  function handleMove(id, direction) {
    setTodos((current) => {
      const nextTodos = moveTodo(current, id, direction);
      
      // Restore focus to support consecutive keyboard triggers, shifting if disabled at boundary
      setTimeout(() => {
        const idx = nextTodos.findIndex((t) => t.id === id);
        if (idx === -1) return;

        let targetDirection = direction;
        if (direction === "up" && idx === 0) {
          targetDirection = "down";
        } else if (direction === "down" && idx === nextTodos.length - 1) {
          targetDirection = "up";
        }

        const buttonId = `move-${targetDirection}-${id}`;
        const btn = document.getElementById(buttonId);
        if (btn) btn.focus();
      }, 0);

      return nextTodos;
    });
  }

  return (
    <section>
      <div className="button-bar">
        <button
          type="button"
          ref={exportTriggerRef}
          onClick={handleExportOpen}
          aria-label="Export todos"
        >
          Export todos
        </button>
        <button
          type="button"
          ref={importTriggerRef}
          onClick={handleImportOpen}
          aria-label="Import todos"
        >
          Import todos
        </button>
      </div>

      {statusMessage && (
        <p className="success-msg" data-testid="status-message">
          {statusMessage}
        </p>
      )}

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
                  onChange={() => setTodos((current) => toggleTodo(current, todo.id))}
                />{" "}
                <span>{todo.title}</span>
              </label>
              <div className="item-actions">
                <button
                  type="button"
                  id={`move-up-${todo.id}`}
                  disabled={index === 0}
                  onClick={() => handleMove(todo.id, "up")}
                  aria-label={`Move ${todo.title} up`}
                >
                  Move up
                </button>
                <button
                  type="button"
                  id={`move-down-${todo.id}`}
                  disabled={index === todos.length - 1}
                  onClick={() => handleMove(todo.id, "down")}
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
              </div>
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
        onClose={handleExportClose}
        className="modal"
        aria-labelledby="export-title"
      >
        <h3 id="export-title">Export todos</h3>
        <div className="dialog-content">
          <label htmlFor="export-json">Your todos as JSON</label>
          <textarea
            id="export-json"
            readOnly
            value={exportJSON}
          />
          <div className="dialog-buttons">
            <button type="button" onClick={handleCopy}>
              Copy
            </button>
            {copied && <span className="copy-indicator" style={{ marginLeft: "0.5rem", alignSelf: "center" }}>Copied</span>}
            <button type="button" onClick={handleExportClose} style={{ marginLeft: "auto" }}>
              Close
            </button>
          </div>
        </div>
      </dialog>

      {/* Import Dialog */}
      <dialog
        ref={importDialogRef}
        onClose={handleImportClose}
        className="modal"
        aria-labelledby="import-title"
      >
        <h3 id="import-title">Import todos</h3>
        <div className="dialog-content">
          <label htmlFor="import-json">Paste todos as JSON</label>
          <textarea
            id="import-json"
            value={importText}
            onChange={(e) => {
              setImportText(e.target.value);
              setValidationResult(null);
            }}
          />

          {validationResult && !validationResult.valid && (
            <p className="error-msg">{validationResult.error}</p>
          )}

          {validationResult && validationResult.valid && (
            <div className="preview-container">
              <p>{validationResult.todos.length} todos will be added</p>
              <ul className="preview-list">
                {validationResult.todos.slice(0, 5).map((todo, idx) => (
                  <li key={idx}>{todo.title}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="dialog-buttons">
            <button type="button" onClick={handlePreview}>
              Preview
            </button>
            <button
              type="button"
              onClick={handleAddImported}
              disabled={!validationResult || !validationResult.valid}
            >
              Add todos
            </button>
            <button type="button" onClick={handleImportClose} style={{ marginLeft: "auto" }}>
              Cancel
            </button>
          </div>
        </div>
      </dialog>
    </section>
  );
}
