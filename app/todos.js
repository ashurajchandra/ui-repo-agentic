"use client";

import { useState, useEffect } from "react";

import { addTodo, remaining, removeTodo, toggleTodo, swapTodos } from "../lib/todos.js";

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount with safe schema validation
  useEffect(() => {
    try {
      const stored = localStorage.getItem("todos");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const validated = parsed.filter(todo => 
            todo &&
            typeof todo === "object" &&
            typeof todo.id === "number" &&
            typeof todo.title === "string" &&
            typeof todo.done === "boolean"
          );
          setTodos(validated);
        }
      }
    } catch (e) {
      console.error("Failed to load todos from localStorage", e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when todos change, but only after initial load completes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("todos", JSON.stringify(todos));
      } catch (e) {
        console.error("Failed to save todos to localStorage", e);
      }
    }
  }, [todos, isLoaded]);

  function submit(event) {
    event.preventDefault();
    setTodos((current) => addTodo(current, title));
    setTitle("");
  }

  function handleMoveUp(index, todoId) {
    if (index === 0) return;
    setTodos((current) => {
      const next = swapTodos(current, index, index - 1);
      if (index === 1) {
        // Since it is moving to index 0, its Move up button will be disabled.
        // Focus the Move down button of the same item so focus is not lost.
        setTimeout(() => {
          const downBtn = document.getElementById(`move-down-${todoId}`);
          downBtn?.focus();
        }, 0);
      }
      return next;
    });
  }

  function handleMoveDown(index, todoId) {
    if (index === todos.length - 1) return;
    setTodos((current) => {
      const next = swapTodos(current, index, index + 1);
      if (index === current.length - 2) {
        // Since it is moving to index length - 1, its Move down button will be disabled.
        // Focus the Move up button of the same item so focus is not lost.
        setTimeout(() => {
          const upBtn = document.getElementById(`move-up-${todoId}`);
          upBtn?.focus();
        }, 0);
      }
      return next;
    });
  }

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
          {todos.map((todo, index) => (
            <li key={todo.id} className={todo.done ? "done" : ""}>
              <label>
                <input type="checkbox" checked={todo.done} onChange={() => setTodos((current) => toggleTodo(current, todo.id))} /> <span>{todo.title}</span>
              </label>
              <div className="todo-actions">
                <button
                  type="button"
                  id={`move-up-${todo.id}`}
                  className="btn-move"
                  onClick={() => handleMoveUp(index, todo.id)}
                  disabled={index === 0}
                  aria-label={`Move up ${todo.title}`}
                >
                  Move up
                </button>
                <button
                  type="button"
                  id={`move-down-${todo.id}`}
                  className="btn-move"
                  onClick={() => handleMoveDown(index, todo.id)}
                  disabled={index === todos.length - 1}
                  aria-label={`Move down ${todo.title}`}
                >
                  Move down
                </button>
                <button type="button" className="link btn-remove" onClick={() => setTodos((current) => removeTodo(current, todo.id))} aria-label={`Remove ${todo.title}`}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="muted" data-testid="count">{remaining(todos)} left</p>
    </section>
  );
}
