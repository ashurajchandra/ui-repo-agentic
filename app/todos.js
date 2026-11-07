"use client";

import { useState, useEffect, useRef } from "react";
import {
  addTodo,
  remaining,
  removeTodo,
  toggleTodo,
  parseSettings,
  sortAndFilterTodos,
} from "../lib/todos.js";

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [settings, setSettings] = useState({ showCompleted: true, sortBy: "newest" });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [lastDeleted, setLastDeleted] = useState(null);

  const listSettingsBtnRef = useRef(null);
  const closeSettingsBtnRef = useRef(null);
  const timerRef = useRef(null);
  const wasOpenRef = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedTodos = localStorage.getItem("todos");
      if (savedTodos) {
        const parsed = JSON.parse(savedTodos);
        if (Array.isArray(parsed)) {
          setTodos(parsed);
        }
      }
    } catch (e) {
      console.error(e);
    }

    try {
      const savedSettings = localStorage.getItem("settings");
      if (savedSettings) {
        setSettings(parseSettings(savedSettings));
      }
    } catch (e) {
      console.error(e);
    }
    setIsLoaded(true);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("todos", JSON.stringify(todos));
      } catch (e) {
        console.error(e);
      }
    }
  }, [todos, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("settings", JSON.stringify(settings));
      } catch (e) {
        console.error(e);
      }
    }
  }, [settings, isLoaded]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Focus management when drawer toggles
  useEffect(() => {
    if (isDrawerOpen) {
      closeSettingsBtnRef.current?.focus();
      wasOpenRef.current = true;
    } else if (wasOpenRef.current) {
      listSettingsBtnRef.current?.focus();
      wasOpenRef.current = false;
    }
  }, [isDrawerOpen]);

  // Escape key close settings drawer
  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDrawerOpen]);

  function submit(event) {
    event.preventDefault();
    setTodos((current) => addTodo(current, title));
    setTitle("");
  }

  function handleDelete(id) {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const index = todos.findIndex((t) => t.id === id);
    if (index !== -1) {
      const todo = todos[index];
      setLastDeleted({ todo, index });
      setTodos((current) => removeTodo(current, id));

      timerRef.current = setTimeout(() => {
        setLastDeleted(null);
      }, 5000);
    }
  }

  function handleUndo() {
    if (lastDeleted) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      const { todo, index } = lastDeleted;
      setTodos((current) => {
        const restored = [...current];
        restored.splice(index, 0, todo);
        return restored;
      });
      setLastDeleted(null);
    }
  }

  const displayedTodos = sortAndFilterTodos(todos, settings);

  return (
    <section>
      <div className="settings-bar">
        <button
          type="button"
          ref={listSettingsBtnRef}
          onClick={() => setIsDrawerOpen(true)}
          aria-label="List settings"
          className="settings-btn"
        >
          List settings
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

      {displayedTodos.length === 0 ? (
        <p className="empty" data-testid="empty">Nothing to do yet.</p>
      ) : (
        <ul data-testid="todo-list">
          {displayedTodos.map((todo) => (
            <li key={todo.id} className={todo.done ? "done" : ""}>
              <div className="todo-item-left" style={{ flex: 1, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  id={`todo-chk-${todo.id}`}
                  checked={todo.done}
                  onChange={() => setTodos((current) => toggleTodo(current, todo.id))}
                />
                <label htmlFor={`todo-chk-${todo.id}`} style={{ flex: 1, cursor: "pointer" }}>
                  <span>{todo.title}</span>
                </label>
              </div>
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

      {isDrawerOpen && (
        <div className="drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
          <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>List settings</h2>
              <button
                type="button"
                ref={closeSettingsBtnRef}
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Close settings"
                className="close-btn"
              >
                Close
              </button>
            </div>
            <div className="settings-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.showCompleted}
                  onChange={(e) =>
                    setSettings((curr) => ({ ...curr, showCompleted: e.target.checked }))
                  }
                />
                <span>Show completed todos</span>
              </label>
            </div>
            <div className="settings-group">
              <label htmlFor="sort-by">Sort by</label>
              <select
                id="sort-by"
                value={settings.sortBy}
                onChange={(e) =>
                  setSettings((curr) => ({ ...curr, sortBy: e.target.value }))
                }
              >
                <option value="newest">Newest first</option>
                <option value="alphabetical">Title A–Z</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {lastDeleted && (
        <div className="toast-container">
          <span className="toast-text">Todo deleted</span>
          <button
            type="button"
            onClick={handleUndo}
            aria-label="Undo delete"
            className="undo-btn"
          >
            Undo
          </button>
        </div>
      )}
    </section>
  );
}
