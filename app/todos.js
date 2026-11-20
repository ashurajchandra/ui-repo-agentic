"use client";

import { useState, useEffect } from "react";

import { addTodo, remaining, removeTodo, toggleTodo, toggleImportant } from "../lib/todos.js";

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("todos");
    if (saved) {
      try {
        setTodos(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("todos", JSON.stringify(todos));
    }
  }, [todos, isLoaded]);

  function submit(event) {
    event.preventDefault();
    setTodos((current) => addTodo(current, title));
    setTitle("");
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
          {todos.map((todo) => (
            <li key={todo.id} className={`${todo.done ? "done" : ""} ${todo.important ? "important" : ""}`.trim()}>
              <label>
                <input type="checkbox" checked={todo.done} onChange={() => setTodos((current) => toggleTodo(current, todo.id))} /> <span>{todo.title}</span>
              </label>
              <button
                type="button"
                className="important-btn"
                aria-pressed={!!todo.important}
                aria-label={todo.important ? "Mark as not important" : "Mark as important"}
                onClick={() => setTodos((current) => toggleImportant(current, todo.id))}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={todo.important ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" style={{ display: "block" }}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
              <button type="button" className="link" onClick={() => setTodos((current) => removeTodo(current, todo.id))} aria-label={`Remove ${todo.title}`}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="muted" data-testid="count">{remaining(todos)} left</p>
    </section>
  );
}
