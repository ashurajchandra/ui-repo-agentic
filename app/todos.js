"use client";

import { useState } from "react";

import { addTodo, remaining, removeTodo, toggleTodo, sortOpenTodos, isOverdue } from "../lib/todos.js";

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  function submit(event) {
    event.preventDefault();
    setTodos((current) => addTodo(current, title, dueDate));
    setTitle("");
    setDueDate("");
  }

  const sortedTodos = sortOpenTodos(todos);

  return (
    <section>
      <form onSubmit={submit}>
        <input id="new-todo" type="text" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs doing?" aria-label="New todo" />
        <input id="due-date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} aria-label="Due date" />
        <button type="submit">Add</button>
      </form>
      {sortedTodos.length === 0 ? (
        <p className="empty" data-testid="empty">Nothing to do yet.</p>
      ) : (
        <ul id="todo-list" data-testid="todo-list">
          {sortedTodos.map((todo) => (
            <li key={todo.id} className={`${todo.done ? "done" : ""} ${isOverdue(todo) ? "overdue" : ""}`}>
              <label>
                <input type="checkbox" checked={todo.done} onChange={() => setTodos((current) => toggleTodo(current, todo.id))} /> <span>{todo.title}</span>
                {todo.dueDate && <span className="due-date-text"> (Due: {todo.dueDate})</span>}
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
