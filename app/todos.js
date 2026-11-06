"use client";

import { useState, useRef } from "react";

import { addTodo, remaining, removeTodo, toggleTodo, editTodo, clearCompletedTodos } from "../lib/todos.js";

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const editButtonRefs = useRef({});
  const isSavingOrCancelling = useRef(false);

  function submit(event) {
    event.preventDefault();
    setTodos((current) => addTodo(current, title));
    setTitle("");
  }

  const handleStartEdit = (todo) => {
    isSavingOrCancelling.current = false;
    setEditingId(todo.id);
    setEditValue(todo.title);
  };

  const restoreFocus = (id) => {
    setTimeout(() => {
      const btn = editButtonRefs.current[id];
      if (btn) {
        btn.focus();
      }
    }, 0);
  };

  const handleSave = (id) => {
    if (isSavingOrCancelling.current) return;
    isSavingOrCancelling.current = true;

    setTodos((current) => editTodo(current, id, editValue));
    setEditingId(null);
    restoreFocus(id);
  };

  const handleCancel = (id) => {
    if (isSavingOrCancelling.current) return;
    isSavingOrCancelling.current = true;

    setEditingId(null);
    restoreFocus(id);
  };

  const handleKeyDown = (event, id) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSave(id);
    } else if (event.key === "Escape") {
      event.preventDefault();
      handleCancel(id);
    }
  };

  const completedCount = todos.filter((todo) => todo.done).length;
  const actualShowConfirm = showClearConfirm && completedCount > 0;

  return (
    <section>
      <form onSubmit={submit}>
        <input id="new-todo" type="text" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs doing?" aria-label="New todo" />
        <button type="submit">Add</button>
      </form>
      {todos.length === 0 ? (
        <p className="empty" data-testid="empty">Nothing to do yet.</p>
      ) : (
        <ul data-testid="todo-list">
          {todos.map((todo) => {
            const isEditing = editingId === todo.id;
            return (
              <li key={todo.id} className={todo.done ? "done" : ""}>
                {isEditing ? (
                  <div style={{ display: "flex", flex: 1, alignItems: "center", gap: "0.6rem" }}>
                    <input
                      type="checkbox"
                      checked={todo.done}
                      onChange={() => setTodos((current) => toggleTodo(current, todo.id))}
                    />
                    <input
                      ref={(el) => {
                        if (el) el.focus();
                      }}
                      type="text"
                      data-testid="edit-input"
                      value={editValue}
                      onChange={(event) => setEditValue(event.target.value)}
                      onKeyDown={(event) => handleKeyDown(event, todo.id)}
                      onBlur={() => handleSave(todo.id)}
                      style={{ flex: 1 }}
                    />
                  </div>
                ) : (
                  <label>
                    <input type="checkbox" checked={todo.done} onChange={() => setTodos((current) => toggleTodo(current, todo.id))} />
                    <span>{todo.title}</span>
                  </label>
                )}
                <button
                  ref={(el) => {
                    editButtonRefs.current[todo.id] = el;
                  }}
                  type="button"
                  className="link"
                  data-testid="edit-button"
                  onClick={() => handleStartEdit(todo)}
                  aria-label={`Edit ${todo.title}`}
                >
                  Edit
                </button>
                <button type="button" className="link" onClick={() => setTodos((current) => removeTodo(current, todo.id))} aria-label={`Remove ${todo.title}`}>
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {actualShowConfirm ? (
        <div className="action-area confirmation-prompt">
          <span>Remove {completedCount} completed todos?</span>
          <button
            type="button"
            data-testid="confirm-clear"
            onClick={() => {
              setTodos((current) => clearCompletedTodos(current));
              setShowClearConfirm(false);
            }}
          >
            Remove
          </button>
          <button
            type="button"
            className="link"
            onClick={() => setShowClearConfirm(false)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="action-area">
          <p className="muted" data-testid="count" style={{ margin: 0 }}>{remaining(todos)} left</p>
          {completedCount > 0 && (
            <button
              type="button"
              className="link"
              data-testid="clear-completed"
              onClick={() => setShowClearConfirm(true)}
            >
              Clear completed
            </button>
          )}
        </div>
      )}
    </section>
  );
}
