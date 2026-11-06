"use client";

import { useState } from "react";

import { addTodo, remaining, removeTodo, toggleTodo, updateTodoPriority } from "../lib/todos.js";

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");

  function submit(event) {
    event.preventDefault();
    const clean = title.trim();
    if (clean === "") {
      // If adding fails, do not reset priority
      return;
    }
    setTodos((current) => addTodo(current, clean, priority));
    setTitle("");
    setPriority("Medium");
  }

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
        <label htmlFor="priority-select">Priority</label>
        <select
          id="priority-select"
          data-testid="priority-select"
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
          tabIndex={0}
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <button type="submit">Add</button>
      </form>
      {todos.length === 0 ? (
        <p className="empty" data-testid="empty">Nothing to do yet.</p>
      ) : (
        <ul data-testid="todo-list">
          {todos.map((todo) => {
            const todoPriority = todo.priority || "Medium";
            const badgeStyle = {
              backgroundColor: todoPriority === "High" ? "#C0392B" : todoPriority === "Low" ? "#2E86C1" : "#D68910",
              color: "#FFFFFF",
              opacity: todo.done ? 0.5 : 1,
            };
            return (
              <li key={todo.id} className={todo.done ? "done" : ""}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={() => setTodos((current) => toggleTodo(current, todo.id))}
                  />
                  <span className="todo-title-container">
                    <span className="todo-title">{todo.title}</span>
                    <span
                      data-testid="priority-badge"
                      className={`priority-badge ${todoPriority.toLowerCase()}`}
                      style={badgeStyle}
                    >
                      {todoPriority === "High" ? "HIGH" : todoPriority === "Low" ? "LOW" : "MED"}
                    </span>
                  </span>
                </label>
                <select
                  data-testid="row-priority-select"
                  className="row-priority-select"
                  value={todoPriority}
                  onChange={(event) => setTodos((current) => updateTodoPriority(current, todo.id, event.target.value))}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                <button
                  type="button"
                  className="link"
                  onClick={() => setTodos((current) => removeTodo(current, todo.id))}
                  aria-label={`Remove ${todo.title}`}
                >
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
