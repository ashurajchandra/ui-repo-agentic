"use client";

import { useState, useEffect, useRef } from "react";

import {
  addTodo,
  remaining,
  removeTodo,
  toggleTodo,
  addTag,
  removeTag,
  validateAndMigrateTodos,
} from "../lib/todos.js";

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState("");
  const [tab, setTab] = useState("all");
  const [selectedTag, setSelectedTag] = useState("All tags");

  const [editingTodoId, setEditingTodoId] = useState(null);
  const [newTag, setNewTag] = useState("");
  const [tagError, setTagError] = useState(false);

  const dialogRef = useRef(null);
  const prevActiveElement = useRef(null);

  // Initialize from localStorage safely
  useEffect(() => {
    try {
      const saved = localStorage.getItem("todos");
      if (saved) {
        const parsed = JSON.parse(saved);
        const validated = validateAndMigrateTodos(parsed);
        setTodos(validated);
      }
    } catch (e) {
      console.error("Failed to load todos from localStorage", e);
      setTodos([]);
    }
    setLoaded(true);
  }, []);

  // Persist to localStorage whenever todos state changes
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem("todos", JSON.stringify(todos));
    } catch (e) {
      console.error("Failed to save todos to localStorage", e);
    }
  }, [todos, loaded]);

  const allActiveTags = Array.from(
    new Set(todos.flatMap((t) => t.tags || []))
  ).sort();

  // Reset selected tag if it was removed from all todos
  useEffect(() => {
    if (selectedTag !== "All tags" && !allActiveTags.includes(selectedTag)) {
      setSelectedTag("All tags");
    }
  }, [todos, selectedTag, allActiveTags]);

  const effectiveSelectedTag =
    selectedTag !== "All tags" && !allActiveTags.includes(selectedTag)
      ? "All tags"
      : selectedTag;

  function submit(event) {
    event.preventDefault();
    setTodos((current) => addTodo(current, title));
    setTitle("");
  }

  const openEditTags = (todoId, event) => {
    prevActiveElement.current = event.currentTarget;
    setEditingTodoId(todoId);
    setNewTag("");
    setTagError(false);
  };

  const handleAddTagSubmit = (e) => {
    e.preventDefault();
    const clean = newTag.trim().toLowerCase();
    const editingTodo = todos.find((t) => t.id === editingTodoId);
    if (!editingTodo) return;

    if (
      clean === "" ||
      clean.length > 20 ||
      (editingTodo.tags && editingTodo.tags.includes(clean))
    ) {
      setTagError(true);
      return;
    }

    setTagError(false);
    setTodos((current) => addTag(current, editingTodoId, clean));
    setNewTag("");
  };

  const handleRemoveTag = (tagToRemove) => {
    setTodos((current) => removeTag(current, editingTodoId, tagToRemove));
  };

  useEffect(() => {
    if (editingTodoId !== null) {
      if (!dialogRef.current?.open) {
        dialogRef.current?.showModal();
      }
    } else {
      if (dialogRef.current?.open) {
        dialogRef.current?.close();
      }
    }
  }, [editingTodoId]);

  const editingTodo = todos.find((t) => t.id === editingTodoId);

  const filteredByTab = todos.filter((t) => {
    if (tab === "active") return !t.done;
    if (tab === "done") return t.done;
    return true;
  });

  const filteredByTag = filteredByTab.filter((t) => {
    if (effectiveSelectedTag === "All tags") return true;
    return t.tags && t.tags.includes(effectiveSelectedTag);
  });

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

      {/* Tabs Row */}
      <div className="tabs-row" role="tablist">
        <button
          type="button"
          className={tab === "all" ? "tab-btn active" : "tab-btn"}
          onClick={() => setTab("all")}
          role="tab"
          aria-selected={tab === "all"}
        >
          All
        </button>
        <button
          type="button"
          className={tab === "active" ? "tab-btn active" : "tab-btn"}
          onClick={() => setTab("active")}
          role="tab"
          aria-selected={tab === "active"}
        >
          Active
        </button>
        <button
          type="button"
          className={tab === "done" ? "tab-btn active" : "tab-btn"}
          onClick={() => setTab("done")}
          role="tab"
          aria-selected={tab === "done"}
        >
          Done
        </button>
      </div>

      {/* Tag Filters Row */}
      <div className="tag-filters-row">
        <button
          type="button"
          className={`tag-filter-chip ${
            effectiveSelectedTag === "All tags" ? "active" : ""
          }`}
          aria-pressed={effectiveSelectedTag === "All tags" ? "true" : "false"}
          onClick={() => setSelectedTag("All tags")}
        >
          All tags
        </button>
        {allActiveTags.map((tag) => (
          <button
            key={tag}
            type="button"
            className={`tag-filter-chip ${
              effectiveSelectedTag === tag ? "active" : ""
            }`}
            aria-pressed={effectiveSelectedTag === tag ? "true" : "false"}
            onClick={() => setSelectedTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {todos.length === 0 ? (
        <p className="empty" data-testid="empty">
          Nothing to do yet.
        </p>
      ) : effectiveSelectedTag !== "All tags" && filteredByTag.length === 0 ? (
        <p className="empty">No todos tagged "{effectiveSelectedTag}" here.</p>
      ) : (
        <ul data-testid="todo-list">
          {filteredByTag.map((todo) => (
            <li key={todo.id} className={todo.done ? "done" : ""}>
              <label className="todo-label">
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() =>
                    setTodos((current) => toggleTodo(current, todo.id))
                  }
                />{" "}
                <span className="todo-title-text">{todo.title}</span>
                {todo.tags && todo.tags.length > 0 && (
                  <span className="todo-title-tags">
                    {todo.tags.map((tag) => (
                      <span key={tag} className="todo-tag-badge">
                        {tag}
                      </span>
                    ))}
                  </span>
                )}
              </label>
              <div className="todo-actions">
                <button
                  type="button"
                  className="link edit-tags-btn"
                  onClick={(e) => openEditTags(todo.id, e)}
                  aria-label={`Edit tags for ${todo.title}`}
                >
                  Edit tags
                </button>
                <button
                  type="button"
                  className="link"
                  onClick={() =>
                    setTodos((current) => removeTodo(current, todo.id))
                  }
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

      {/* HTML5 Dialog Modal */}
      <dialog
        ref={dialogRef}
        className="tags-dialog"
        onClose={() => {
          setEditingTodoId(null);
          if (prevActiveElement.current) {
            prevActiveElement.current.focus();
          }
        }}
      >
        {editingTodo && (
          <div className="dialog-content">
            <h2>Tags for {editingTodo.title}</h2>
            <form onSubmit={handleAddTagSubmit} className="dialog-form">
              <label htmlFor="add-tag-input">Add a tag</label>
              <div className="dialog-input-row">
                <input
                  id="add-tag-input"
                  type="text"
                  value={newTag}
                  onChange={(e) => {
                    setNewTag(e.target.value);
                    setTagError(false);
                  }}
                  placeholder="Tag name"
                />
                <button type="submit">Add</button>
              </div>
              {tagError && (
                <p className="error-message">
                  Enter a new tag of up to 20 characters
                </p>
              )}
            </form>

            <div className="dialog-tags-section">
              <h3>Current Tags</h3>
              <div className="dialog-tags-list">
                {(editingTodo.tags || []).length === 0 ? (
                  <p className="muted">No tags yet.</p>
                ) : (
                  (editingTodo.tags || []).map((tag) => (
                    <span key={tag} className="dialog-tag-badge">
                      {tag}
                      <button
                        type="button"
                        className="remove-tag-btn"
                        onClick={() => handleRemoveTag(tag)}
                        aria-label={`Remove tag ${tag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="dialog-footer">
              <button
                type="button"
                className="done-btn"
                onClick={() => dialogRef.current?.close()}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
