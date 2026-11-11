"use client";

import { useState, useEffect, useRef } from "react";

import {
  addTodo,
  remaining,
  removeTodo,
  toggleTodo,
  moveTodoUp,
  moveTodoDown,
  exportTodos,
  validateImport
} from "../lib/todos.js";

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [title, setTitle] = useState("");

  // Dialog open states
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Export specific states
  const [copied, setCopied] = useState(false);

  // Import specific states
  const [importText, setImportText] = useState("");
  const [importPreview, setImportPreview] = useState(null);
  const [importError, setImportError] = useState("");
  const [importSummary, setImportSummary] = useState("");

  // Trigger refs for returning focus
  const exportTriggerRef = useRef(null);
  const importTriggerRef = useRef(null);

  // Reorder focus restoration state
  const [pendingFocus, setPendingFocus] = useState(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("todos");
    if (saved) {
      try {
        setTodos(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading todos from localStorage", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("todos", JSON.stringify(todos));
    }
  }, [todos, isLoaded]);

  // Focus restoration after reordering
  useEffect(() => {
    if (pendingFocus) {
      const btnId = `move-${pendingFocus.direction}-${pendingFocus.id}`;
      let element = document.getElementById(btnId);
      if (element && element.disabled) {
        const otherDirection = pendingFocus.direction === "up" ? "down" : "up";
        const otherId = `move-${otherDirection}-${pendingFocus.id}`;
        const otherElement = document.getElementById(otherId);
        if (otherElement) {
          element = otherElement;
        }
      }
      if (element) {
        element.focus();
      }
      setPendingFocus(null);
    }
  }, [todos, pendingFocus]);

  // Escape listener to close dialogs
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        if (isExportOpen) {
          closeExport();
        } else if (isImportOpen) {
          closeImport();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExportOpen, isImportOpen]);

  function submit(event) {
    event.preventDefault();
    setTodos((current) => addTodo(current, title));
    setTitle("");
  }

  function handleMoveUp(id) {
    setPendingFocus({ id, direction: "up" });
    setTodos((current) => moveTodoUp(current, id));
  }

  function handleMoveDown(id) {
    setPendingFocus({ id, direction: "down" });
    setTodos((current) => moveTodoDown(current, id));
  }

  // Export Dialog handlers
  function closeExport() {
    setIsExportOpen(false);
    setCopied(false);
    exportTriggerRef.current?.focus();
  }

  function handleCopy() {
    navigator.clipboard.writeText(exportTodos(todos));
    setCopied(true);
  }

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Import Dialog handlers
  function closeImport() {
    setIsImportOpen(false);
    setImportText("");
    setImportPreview(null);
    setImportError("");
    setImportSummary("");
    importTriggerRef.current?.focus();
  }

  function handlePreview() {
    const res = validateImport(importText);
    if (res.valid) {
      setImportPreview(res.todos);
      setImportError("");
    } else {
      setImportPreview(null);
      setImportError(res.error || "This is not a list of todos");
    }
  }

  function handleAddTodos() {
    if (!importPreview) return;
    let addedCount = 0;
    let skippedCount = 0;
    const nextTodos = [...todos];
    for (const item of importPreview) {
      const exists = nextTodos.some(
        (t) => t.title.toLowerCase() === item.title.toLowerCase()
      );
      if (exists) {
        skippedCount++;
      } else {
        const id = nextTodos.reduce((highest, todo) => Math.max(highest, todo.id), 0) + 1;
        nextTodos.push({
          id,
          title: item.title,
          done: item.done
        });
        addedCount++;
      }
    }
    setTodos(nextTodos);
    setImportSummary(`Added ${addedCount}, skipped ${skippedCount} already in your list`);
  }

  return (
    <section>
      <div className="toolbar">
        <button
          ref={exportTriggerRef}
          onClick={() => setIsExportOpen(true)}
          aria-label="Export todos"
          type="button"
        >
          Export
        </button>
        <button
          ref={importTriggerRef}
          onClick={() => setIsImportOpen(true)}
          aria-label="Import todos"
          type="button"
        >
          Import
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
        <p className="empty" data-testid="empty">Nothing to do yet.</p>
      ) : (
        <ul data-testid="todo-list">
          {todos.map((todo, index) => (
            <li key={todo.id} className={todo.done ? "done" : ""}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1 }}>
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => setTodos((current) => toggleTodo(current, todo.id))}
                />{" "}
                <span>{todo.title}</span>
              </label>
              <div className="todo-actions">
                <button
                  id={`move-up-${todo.id}`}
                  type="button"
                  disabled={index === 0}
                  onClick={() => handleMoveUp(todo.id)}
                  aria-label={`Move ${todo.title} up`}
                >
                  Move up
                </button>
                <button
                  id={`move-down-${todo.id}`}
                  type="button"
                  disabled={index === todos.length - 1}
                  onClick={() => handleMoveDown(todo.id)}
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
      <p className="muted" data-testid="count">{remaining(todos)} left</p>

      {/* Export Dialog */}
      {isExportOpen && (
        <div className="modal-overlay" onClick={closeExport}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="export-title">
            <h2 id="export-title">Export todos</h2>
            <label htmlFor="export-textarea">Your todos as JSON</label>
            <textarea
              id="export-textarea"
              readOnly
              value={exportTodos(todos)}
            />
            <div className="modal-actions">
              <button type="button" onClick={handleCopy}>
                Copy
              </button>
              {copied && <span className="copy-feedback">Copied</span>}
              <button type="button" className="btn-secondary" onClick={closeExport}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Dialog */}
      {isImportOpen && (
        <div className="modal-overlay" onClick={closeImport}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="import-title">
            <h2 id="import-title">Import todos</h2>
            <label htmlFor="import-textarea">Paste todos as JSON</label>
            <textarea
              id="import-textarea"
              value={importText}
              onChange={(e) => {
                setImportText(e.target.value);
                setImportPreview(null);
                setImportError("");
                setImportSummary("");
              }}
            />
            {importError && (
              <p className="error" style={{ color: "red", fontWeight: "bold", margin: "0.5rem 0" }}>
                {importError}
              </p>
            )}
            {importPreview && (
              <div style={{ margin: "0.5rem 0" }}>
                <p>{importPreview.length} todos will be added</p>
                <ul style={{ border: "1px solid var(--line)", borderRadius: "6px", maxHeight: "150px", overflowY: "auto", background: "#f8fafc", padding: "0.5rem" }}>
                  {importPreview.slice(0, 5).map((t, i) => (
                    <li key={i} style={{ borderBottom: "1px solid var(--line)", padding: "0.25rem 0.5rem" }}>
                      {t.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {importSummary && (
              <p className="summary" style={{ color: "green", fontWeight: "bold", margin: "0.5rem 0" }}>
                {importSummary}
              </p>
            )}
            <div className="modal-actions">
              <button type="button" onClick={handlePreview}>
                Preview
              </button>
              <button
                type="button"
                disabled={!importPreview}
                onClick={handleAddTodos}
              >
                Add todos
              </button>
              <button type="button" className="btn-secondary" onClick={closeImport}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
