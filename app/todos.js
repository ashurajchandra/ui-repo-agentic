"use client";

import { useState } from "react";

import { addTodo, remaining, removeTodo, toggleTodo, updateTodoPriority } from "../lib/todos.js";

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [editingTodoId, setEditingTodoId] = useState(null);

  function submit(event) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }
    setTodos((current) => addTodo(current, title, priority));
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
        <div className="priority-select-container">
          <label htmlFor="priority-select">Priority</label>
          <select
            id="priority-select"
            data-testid="priority-select"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <button type="submit">Add</button>
      </form>
      {todos.length === 0 ? (
        <p className="empty" data-testid="empty">Nothing to do yet.</p>
      ) : (
        <ul data-testid="todo-list">
          {todos.map((todo) => {
            const priorityVal = todo.priority || "Medium";
            const badgeText = priorityVal === "High" ? "HIGH" : (priorityVal === "Low" ? "LOW" : "MED");
            return (
              <li key={todo.id} className={todo.done ? "done" : ""}>
                <label className="todo-label">
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={() => setTodos((current) => toggleTodo(current, todo.id))}
                  />
                  <div className="todo-content">
                    <span className="todo-title">{todo.title}</span>
                    {editingTodoId === todo.id ? (
                      <select
                        data-testid="row-priority-select"
                        className={`row-priority-select priority-${priorityVal.toLowerCase()}`}
                        value={priorityVal}
                        autoFocus
                        onBlur={() => setEditingTodoId(null)}
                        onClick={(e) => e.preventDefault()}
                        onChange={(e) => {
                          const newPriority = e.target.value;
                          setTodos((current) => updateTodoPriority(current, todo.id, newPriority));
                          setEditingTodoId(null);
                        }}
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    ) : (
                      <span
                        data-testid="priority-badge"
                        className={`priority-badge priority-${priorityVal.toLowerCase()}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setEditingTodoId(todo.id);
                        }}
                      >
                        {badgeText}
                      </span>
                    )}
                  </div>
                </label>
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
