"use client";

import { useState, useEffect } from "react";

import { addTodo, remaining, removeTodo, toggleTodo, sortTodos, isOverdue } from "../lib/todos.js";

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [today, setToday] = useState("");

  useEffect(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    setToday(`${year}-${month}-${day}`);
  }, []);

  function submit(event) {
    event.preventDefault();
    setTodos((current) => addTodo(current, title, dueDate));
    setTitle("");
    setDueDate("");
  }

  const sorted = sortTodos(todos);

  return (
    <section>
      <form onSubmit={submit}>
        <input id="new-todo" type="text" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs doing?" aria-label="New todo" />
        <input id="due-date-input" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} aria-label="Due date" />
        <button type="submit">Add</button>
      </form>
      {todos.length === 0 ? (
        <p className="empty" data-testid="empty">Nothing to do yet.</p>
      ) : (
        <ul data-testid="todo-list">
          {sorted.map((todo) => {
            const overdue = today ? isOverdue(todo, today) : false;
            const className = `${todo.done ? "done" : ""} ${overdue ? "overdue" : ""}`.trim();

            return (
              <li key={todo.id} className={className}>
                <label>
                  <input type="checkbox" checked={todo.done} onChange={() => setTodos((current) => toggleTodo(current, todo.id))} />{" "}
                  <span>{todo.title}</span>
                  {todo.dueDate && <span className="due-date">Due: {todo.dueDate}</span>}
                </label>
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
