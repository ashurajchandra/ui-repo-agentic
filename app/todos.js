"use client";

import { useState, useRef, useEffect } from "react";

import { addTodo, remaining, removeTodo, toggleTodo, updateDueDate } from "../lib/todos.js";

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  const dateInputRefs = useRef({});
  const hasLoaded = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("todos");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(
            (todo) =>
              todo &&
              typeof todo === "object" &&
              typeof todo.id === "number" &&
              typeof todo.title === "string"
          ).map(todo => ({
            id: todo.id,
            title: todo.title,
            done: !!todo.done,
            ...(todo.dueDate ? { dueDate: String(todo.dueDate) } : {}),
            ...(todo.important !== undefined ? { important: !!todo.important } : {})
          }));
          setTodos(valid);
        }
      }
    } catch (e) {
      console.error("Failed to parse todos from localStorage", e);
    } finally {
      hasLoaded.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hasLoaded.current) return;
    try {
      localStorage.setItem("todos", JSON.stringify(todos));
    } catch (e) {
      console.error("Failed to save todos to localStorage", e);
    }
  }, [todos]);

  function submit(event) {
    event.preventDefault();
    setTodos((current) => addTodo(current, title, newDueDate));
    setTitle("");
    setNewDueDate("");
  }

  function handleClearDate(id) {
    setTodos((current) => updateDueDate(current, id, ""));
    if (dateInputRefs.current[id]) {
      dateInputRefs.current[id].focus();
    }
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const todayStr = `${year}-${month}-${day}`;

  return (
    <section>
      <form onSubmit={submit}>
        <input id="new-todo" type="text" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs doing?" aria-label="New todo" />
        <input id="new-due-date" type="date" value={newDueDate} onChange={(event) => setNewDueDate(event.target.value)} aria-label="Due date" />
        <button type="submit">Add</button>
      </form>
      {todos.length === 0 ? (
        <p className="empty" data-testid="empty">Nothing to do yet.</p>
      ) : (
        <ul data-testid="todo-list">
          {todos.map((todo) => {
            const isOverdue = !todo.done && todo.dueDate && todo.dueDate < todayStr;
            const liClassName = [
              todo.done ? "done" : "",
              isOverdue ? "overdue" : ""
            ].filter(Boolean).join(" ");

            return (
              <li key={todo.id} className={liClassName}>
                <label>
                  <input type="checkbox" checked={todo.done} onChange={() => setTodos((current) => toggleTodo(current, todo.id))} /> <span>{todo.title}</span>
                </label>
                <input
                  type="date"
                  value={todo.dueDate || ""}
                  ref={(el) => {
                    if (el) {
                      dateInputRefs.current[todo.id] = el;
                    } else {
                      delete dateInputRefs.current[todo.id];
                    }
                  }}
                  onChange={(e) => {
                    const newVal = e.target.value;
                    setTodos((current) => updateDueDate(current, todo.id, newVal));
                  }}
                  aria-label={`Due date for ${todo.title}`}
                />
                <button
                  type="button"
                  disabled={!todo.dueDate}
                  onClick={() => handleClearDate(todo.id)}
                >
                  Clear
                </button>
                <button type="button" className="link" onClick={() => setTodos((current) => removeTodo(current, todo.id))} aria-label={`Remove ${todo.title}`}>
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <p className="muted" data-testid="count">{remaining(todos)} left</p>
    </section>
  );
}
