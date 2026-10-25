"use client";

import { useState } from "react";

import { addTodo, remaining, removeTodo, toggleTodo } from "../lib/todos.js";

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");

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
            <li key={todo.id} className={todo.done ? "done" : ""}>
              <label>
                <input type="checkbox" checked={todo.done} onChange={() => setTodos((current) => toggleTodo(current, todo.id))} /> <span>{todo.title}</span>
              </label>
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
