"use client";

import { useState, useEffect, useRef } from "react";

import {
  addTodo,
  remaining,
  removeTodo,
  toggleTodo,
  markDoneMultiple,
  removeMultiple
} from "../lib/todos.js";

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const selectAllRef = useRef(null);
  const dialogRef = useRef(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("todos");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTodos(parsed);
        }
      } catch (e) {
        console.error("Error reading todos from localStorage", e);
      }
    }
  }, []);

  const saveTodos = (newTodos) => {
    setTodos(newTodos);
    localStorage.setItem("todos", JSON.stringify(newTodos));
  };

  function submit(event) {
    event.preventDefault();
    const next = addTodo(todos, title);
    saveTodos(next);
    setTitle("");
  }

  const handleToggle = (id) => {
    const next = toggleTodo(todos, id);
    saveTodos(next);
  };

  const handleRemove = (id) => {
    const next = removeTodo(todos, id);
    saveTodos(next);
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  // Compute visible todos
  const visibleTodos = todos.filter((todo) => {
    if (filter === "active" && todo.done) return false;
    if (filter === "done" && !todo.done) return false;

    if (searchText) {
      const cleanSearch = searchText.toLowerCase();
      return todo.title.toLowerCase().includes(cleanSearch);
    }
    return true;
  });

  const allVisibleSelected =
    visibleTodos.length > 0 &&
    visibleTodos.every((todo) => selectedIds.includes(todo.id));

  const someVisibleSelected =
    visibleTodos.length > 0 &&
    visibleTodos.some((todo) => selectedIds.includes(todo.id)) &&
    !allVisibleSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someVisibleSelected;
    }
  }, [someVisibleSelected]);

  const handleSelectAllChange = () => {
    const visibleIds = visibleTodos.map((todo) => todo.id);
    if (allVisibleSelected) {
      // Deselect all visible
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      // Select all visible
      setSelectedIds((prev) => {
        const union = new Set([...prev, ...visibleIds]);
        return Array.from(union);
      });
    }
  };

  const handleBulkMarkDone = () => {
    const next = markDoneMultiple(todos, selectedIds);
    saveTodos(next);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    const next = removeMultiple(todos, selectedIds);
    saveTodos(next);
    setSelectedIds([]);
    setShowConfirm(false);
  };

  // Focus trap and ESC key handler for modal
  useEffect(() => {
    if (showConfirm && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex="0"]'
      );
      if (focusable.length > 0) {
        focusable[0].focus();
      }

      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          setShowConfirm(false);
        } else if (e.key === "Tab") {
          const focusables = Array.from(focusable);
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
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [showConfirm]);

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

      {/* Search and filter UI */}
      <div
        className="search-container"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.25rem",
          marginBottom: "1rem"
        }}
      >
        <label htmlFor="search-todos" style={{ fontWeight: "bold" }}>
          Search todos
        </label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            id="search-todos"
            type="text"
            placeholder="Type to filter..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ flex: 1 }}
          />
          {searchText && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearchText("")}
              style={{ background: "var(--muted)", color: "white" }}
            >
              Clear search
            </button>
          )}
        </div>
      </div>

      <div
        className="filter-tabs"
        style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}
      >
        <button
          type="button"
          onClick={() => setFilter("all")}
          style={{
            background: filter === "all" ? "var(--accent)" : "transparent",
            color: filter === "all" ? "white" : "var(--text)",
            border: "1px solid var(--line)"
          }}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setFilter("active")}
          style={{
            background: filter === "active" ? "var(--accent)" : "transparent",
            color: filter === "active" ? "white" : "var(--text)",
            border: "1px solid var(--line)"
          }}
        >
          Active
        </button>
        <button
          type="button"
          onClick={() => setFilter("done")}
          style={{
            background: filter === "done" ? "var(--accent)" : "transparent",
            color: filter === "done" ? "white" : "var(--text)",
            border: "1px solid var(--line)"
          }}
        >
          Done
        </button>
      </div>

      {/* Toolbar */}
      <div
        className="toolbar"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0.5rem",
          marginBottom: "0.75rem",
          background: "var(--bg)",
          border: "1px solid var(--line)",
          borderRadius: "8px"
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            cursor: "pointer",
            fontWeight: "500"
          }}
        >
          <input
            ref={selectAllRef}
            type="checkbox"
            checked={allVisibleSelected}
            onChange={handleSelectAllChange}
          />
          <span>Select all</span>
        </label>
        {selectedIds.length > 0 && (
          <div
            className="toolbar-actions"
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>
              {selectedIds.length} selected
            </span>
            <button
              type="button"
              onClick={handleBulkMarkDone}
              style={{ padding: "0.4rem 0.7rem", fontSize: "0.9rem" }}
            >
              Mark done
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              style={{
                padding: "0.4rem 0.7rem",
                fontSize: "0.9rem",
                background: "#d32f2f"
              }}
            >
              Delete selected
            </button>
          </div>
        )}
      </div>

      {todos.length === 0 ? (
        <p className="empty" data-testid="empty">
          Nothing to do yet. Add your first todo above.
        </p>
      ) : visibleTodos.length === 0 ? (
        <p className="empty" data-testid="empty">
          {searchText ? `No todos match "${searchText}".` : `No todos.`}
        </p>
      ) : (
        <ul data-testid="todo-list">
          {visibleTodos.map((todo) => (
            <li key={todo.id} className={todo.done ? "done" : ""}>
              <input
                type="checkbox"
                aria-label={`Select ${todo.title}`}
                checked={selectedIds.includes(todo.id)}
                onChange={() => {
                  setSelectedIds((prev) =>
                    prev.includes(todo.id)
                      ? prev.filter((id) => id !== todo.id)
                      : [...prev, todo.id]
                  );
                }}
              />
              <label>
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => handleToggle(todo.id)}
                />{" "}
                <span>{todo.title}</span>
              </label>
              <button
                type="button"
                className="link"
                onClick={() => handleRemove(todo.id)}
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

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="modal-backdrop" onClick={() => setShowConfirm(false)}>
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="confirm-title" style={{ fontSize: "1.25rem" }}>
              Delete {selectedIds.length} todos?
            </h2>
            <p style={{ margin: "0.5rem 0 1.5rem 0", color: "var(--muted)" }}>
              This can't be undone.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                style={{
                  background: "transparent",
                  border: "1px solid var(--line)",
                  color: "var(--text)"
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="danger"
                onClick={handleBulkDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
