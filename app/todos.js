"use client";

import { useState, useEffect, useRef } from "react";

import {
  addTodo,
  remaining,
  removeTodo,
  toggleTodo,
  validateSettings,
  validateTodos,
  filterAndSortTodos,
  DEFAULT_SETTINGS
} from "../lib/todos.js";

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [undoState, setUndoState] = useState(null); // { backupTodos: [...] }
  const [mounted, setMounted] = useState(false);

  const settingsButtonRef = useRef(null);
  const undoTimeoutRef = useRef(null);

  useEffect(() => {
    // Load todos from localStorage
    const savedTodos = localStorage.getItem("todos");
    if (savedTodos) {
      try {
        const parsed = JSON.parse(savedTodos);
        if (Array.isArray(parsed)) {
          setTodos(validateTodos(parsed));
        }
      } catch (e) {
        // Safe fallback
      }
    }

    // Load settings from localStorage
    const savedSettings = localStorage.getItem("settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(validateSettings(parsed));
      } catch (e) {
        // Safe fallback
      }
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        closeDrawer();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen]);

  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
    };
  }, []);

  function saveTodos(newTodos) {
    setTodos(newTodos);
    localStorage.setItem("todos", JSON.stringify(newTodos));
  }

  function saveSettings(newSettings) {
    const validated = validateSettings(newSettings);
    setSettings(validated);
    localStorage.setItem("settings", JSON.stringify(validated));
  }

  function submit(event) {
    event.preventDefault();
    const updated = addTodo(todos, title);
    if (updated !== todos) {
      saveTodos(updated);
    }
    setTitle("");
  }

  function handleDelete(id) {
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }

    const backup = [...todos];
    const updated = removeTodo(todos, id);
    saveTodos(updated);

    const timeoutId = setTimeout(() => {
      setUndoState(null);
      undoTimeoutRef.current = null;
    }, 5000);

    undoTimeoutRef.current = timeoutId;
    setUndoState({
      backupTodos: backup
    });
  }

  function handleUndo() {
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }
    if (undoState) {
      saveTodos(undoState.backupTodos);
      setUndoState(null);
    }
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setTimeout(() => {
      settingsButtonRef.current?.focus();
    }, 0);
  }

  if (!mounted) {
    return null; // Prevent SSR/hydration mismatches
  }

  const displayedTodos = filterAndSortTodos(todos, settings);

  return (
    <section>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <form onSubmit={submit} style={{ margin: 0, flex: 1 }}>
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
        <button
          type="button"
          ref={settingsButtonRef}
          aria-label="List settings"
          onClick={() => setDrawerOpen(true)}
        >
          List settings
        </button>
      </div>

      {displayedTodos.length === 0 ? (
        <p className="empty" data-testid="empty">Nothing to do yet.</p>
      ) : (
        <ul data-testid="todo-list">
          {displayedTodos.map((todo) => (
            <li key={todo.id} className={todo.done ? "done" : ""}>
              <label>
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => saveTodos(toggleTodo(todos, todo.id))}
                />{" "}
                <span>{todo.title}</span>
              </label>
              <button
                type="button"
                className="link"
                onClick={() => handleDelete(todo.id)}
                aria-label={`Remove ${todo.title}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="muted" data-testid="count">{remaining(todos)} left</p>

      {drawerOpen && (
        <>
          <div className="drawer-overlay" onClick={closeDrawer} />
          <div className="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
            <h2 id="drawer-title" style={{ margin: "0 0 1rem 0", fontSize: "1.4rem" }}>List settings</h2>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  id="show-completed-checkbox"
                  checked={settings.showCompleted}
                  onChange={(e) => saveSettings({ ...settings, showCompleted: e.target.checked })}
                />
                Show completed todos
              </label>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginBottom: "1.5rem" }}>
              <label htmlFor="sort-by" style={{ fontWeight: "500" }}>Sort by</label>
              <select
                id="sort-by"
                value={settings.sortBy}
                onChange={(e) => saveSettings({ ...settings, sortBy: e.target.value })}
                style={{ padding: "0.5rem", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--card)", color: "inherit" }}
              >
                <option value="Newest first">Newest first</option>
                <option value="Title A–Z">Title A–Z</option>
              </select>
            </div>
            <button
              type="button"
              className="close-btn"
              aria-label="Close settings"
              onClick={closeDrawer}
              style={{ marginTop: "auto", width: "100%" }}
            >
              Close
            </button>
          </div>
        </>
      )}

      {undoState && (
        <div className="toast" role="status">
          <span>Todo deleted</span>
          <button type="button" aria-label="Undo delete" onClick={handleUndo}>
            Undo
          </button>
        </div>
      )}
    </section>
  );
}
