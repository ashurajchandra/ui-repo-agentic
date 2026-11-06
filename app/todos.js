"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import {
  addTodo,
  remaining,
  removeTodo,
  toggleTodo,
  filterTodos,
  getCounts,
  recoverTodos,
  isOverdue,
  getDueText,
} from "../lib/todos.js";

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Load from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem("todos.v1");
    setTodos(recoverTodos(raw));
    setIsLoaded(true);
  }, []);

  // Save to localStorage when todos change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("todos.v1", JSON.stringify(todos));
    }
  }, [todos, isLoaded]);

  const rawFilter = searchParams ? (searchParams.get("filter") || "") : "";
  const currentFilter = ["active", "completed"].includes(rawFilter.toLowerCase())
    ? rawFilter.toLowerCase()
    : "all";

  function setFilter(newFilter) {
    if (!router || !pathname) return;
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    if (newFilter === "all") {
      params.delete("filter");
    } else {
      params.set("filter", newFilter);
    }
    router.push(pathname + (params.toString() ? "?" + params.toString() : ""));
  }

  function submit(event) {
    event.preventDefault();
    setTodos((current) => addTodo(current, title, dueDate));
    setTitle("");
    setDueDate("");
  }

  const counts = getCounts(todos);
  const filtered = filterTodos(todos, currentFilter);

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
        <label htmlFor="due-input" className="due-form-label">Due</label>
        <input
          id="due-input"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          data-testid="due-input"
        />
        <button type="submit">Add</button>
      </form>

      {/* Filter Tabs */}
      <div className="tabs" role="tablist">
        <button
          type="button"
          id="filter-all"
          data-testid="filter-all"
          aria-pressed={currentFilter === "all" ? "true" : "false"}
          onClick={() => setFilter("all")}
          className={currentFilter === "all" ? "active-tab" : ""}
        >
          All ({counts.all})
        </button>
        <button
          type="button"
          id="filter-active"
          data-testid="filter-active"
          aria-pressed={currentFilter === "active" ? "true" : "false"}
          onClick={() => setFilter("active")}
          className={currentFilter === "active" ? "active-tab" : ""}
        >
          Active ({counts.active})
        </button>
        <button
          type="button"
          id="filter-completed"
          data-testid="filter-completed"
          aria-pressed={currentFilter === "completed" ? "true" : "false"}
          onClick={() => setFilter("completed")}
          className={currentFilter === "completed" ? "active-tab" : ""}
        >
          Completed ({counts.completed})
        </button>
      </div>

      {filtered.length === 0 ? (
        currentFilter === "active" ? (
          <p className="empty" data-testid="empty">No active todos.</p>
        ) : currentFilter === "completed" ? (
          <p className="empty" data-testid="empty">No completed todos.</p>
        ) : (
          <p className="empty" data-testid="empty">Nothing to do yet.</p>
        )
      ) : (
        <ul data-testid="todo-list">
          {filtered.map((todo) => (
            <li key={todo.id} className={todo.done ? "done" : ""}>
              <label className="todo-label">
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => setTodos((current) => toggleTodo(current, todo.id))}
                />
                <div className="todo-content">
                  <span className="todo-title">{todo.title}</span>
                  {todo.dueDate && (
                    <span
                      data-testid="due-label"
                      className={`due-label ${isOverdue(todo.dueDate, todo.done) ? "overdue" : ""}`}
                    >
                      {getDueText(todo.dueDate, todo.done)}
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
          ))}
        </ul>
      )}
      <p className="muted" data-testid="count">{remaining(todos)} left</p>
    </section>
  );
}
