"use client";

import { useState, useEffect, useRef } from "react";
import { addTodo, remaining, removeTodo, toggleTodo, markDoneBulk, deleteBulk } from "../lib/todos.js";

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // "all" | "active" | "done"
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const selectAllRef = useRef(null);
  const dialogRef = useRef(null);

  // Persistence across page reloads
  useEffect(() => {
    const saved = localStorage.getItem("todos");
    if (saved) {
      try {
        setTodos(JSON.parse(saved));
      } catch (e) {}
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("todos", JSON.stringify(todos));
    }
  }, [todos, isLoaded]);

  // Handle Escape key to close dialog
  useEffect(() => {
    if (!isDialogOpen) return;
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsDialogOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDialogOpen]);

  // Focus dialog on open
  useEffect(() => {
    if (isDialogOpen && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [isDialogOpen]);

  function submit(event) {
    event.preventDefault();
    setTodos((current) => addTodo(current, title));
    setTitle("");
  }

  // Filtering visible todos
  const visibleTodos = todos.filter((todo) => {
    const matchesSearch = todo.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && !todo.done) ||
      (filter === "done" && todo.done);
    return matchesSearch && matchesFilter;
  });

  const visibleSelected = visibleTodos.filter((t) => selectedIds.includes(t.id));
  const isAllVisibleSelected = visibleTodos.length > 0 && visibleSelected.length === visibleTodos.length;
  const isSomeVisibleSelected = visibleSelected.length > 0 && visibleSelected.length < visibleTodos.length;

  // Sync indeterminate state of "Select all" checkbox
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isSomeVisibleSelected;
    }
  }, [isSomeVisibleSelected]);

  const handleSelectAllChange = () => {
    if (isAllVisibleSelected) {
      const visibleIds = visibleTodos.map((t) => t.id);
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => {
        const newSelection = [...prev];
        visibleTodos.forEach((t) => {
          if (!newSelection.includes(t.id)) {
            newSelection.push(t.id);
          }
        });
        return newSelection;
      });
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleMarkDoneBulk = () => {
    setTodos((current) => markDoneBulk(current, selectedIds));
    setSelectedIds([]);
  };

  const handleDeleteConfirm = () => {
    setTodos((current) => deleteBulk(current, selectedIds));
    setSelectedIds([]);
    setIsDialogOpen(false);
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

      {/* Search box with visible label */}
      <div className="search-box">
        <label htmlFor="search-input" className="search-label">
          Search todos
        </label>
        <div className="search-input-container">
          <input
            id="search-input"
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Type to filter..."
          />
          {search && (
            <button
              type="button"
              className="clear-search-btn"
              aria-label="Clear search"
              onClick={() => setSearch("")}
            >
              Clear search
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          type="button"
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          type="button"
          className={filter === "active" ? "active" : ""}
          onClick={() => setFilter("active")}
        >
          Active
        </button>
        <button
          type="button"
          className={filter === "done" ? "active" : ""}
          onClick={() => setFilter("done")}
        >
          Done
        </button>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <label className="select-all-label">
          <input
            type="checkbox"
            ref={selectAllRef}
            checked={isAllVisibleSelected}
            onChange={handleSelectAllChange}
            aria-label="Select all"
          />
          <span>Select all</span>
        </label>

        {selectedIds.length > 0 && (
          <div className="bulk-actions">
            <span className="selected-count">{selectedIds.length} selected</span>
            <button type="button" className="btn-bulk" onClick={handleMarkDoneBulk}>
              Mark done
            </button>
            <button
              type="button"
              className="btn-bulk btn-danger"
              onClick={() => setIsDialogOpen(true)}
            >
              Delete selected
            </button>
          </div>
        )}
      </div>

      {/* Todos List */}
      {todos.length === 0 ? (
        <p className="empty" data-testid="empty">
          Nothing to do yet. Add your first todo above.
        </p>
      ) : visibleTodos.length === 0 ? (
        <p className="empty" data-testid="empty">
          No todos match '{search}'.
        </p>
      ) : (
        <ul data-testid="todo-list">
          {visibleTodos.map((todo) => (
            <li key={todo.id} className={todo.done ? "done" : ""}>
              <input
                type="checkbox"
                aria-label={`Select ${todo.title}`}
                checked={selectedIds.includes(todo.id)}
                onChange={() => handleSelectOne(todo.id)}
                className="selection-checkbox"
              />
              <label className="todo-done-label">
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => setTodos((current) => toggleTodo(current, todo.id))}
                />{" "}
                <span>{todo.title}</span>
              </label>
              <button
                type="button"
                className="link"
                onClick={() => {
                  setTodos((current) => removeTodo(current, todo.id));
                  setSelectedIds((prev) => prev.filter((id) => id !== todo.id));
                }}
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
      {isDialogOpen && (
        <div className="modal-overlay">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            className="modal-dialog"
            aria-labelledby="dialog-title"
          >
            <h2 id="dialog-title">Delete {selectedIds.length} todos?</h2>
            <p className="dialog-text">This can't be undone.</p>
            <div className="dialog-buttons">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger-confirm"
                onClick={handleDeleteConfirm}
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
