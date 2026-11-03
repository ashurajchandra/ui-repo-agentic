"use client";

import React, { useState } from "react";

import { addTodo, remaining, removeTodo, toggleTodo } from "../lib/todos.js";

export default function Todos({ initialTitle = "" } = {}) {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState(initialTitle);

  function submit(event) {
    event.preventDefault();
    setTodos((current) => addTodo(current, title));
    setTitle("");
  }

  return React.createElement(
    "section",
    null,
    React.createElement(
      "form",
      { onSubmit: submit },
      React.createElement("input", {
        id: "new-todo",
        type: "text",
        value: title,
        onChange: (event) => setTitle(event.target.value),
        placeholder: "What needs doing?",
        "aria-label": "New todo",
        maxLength: 60,
      }),
      React.createElement(
        "div",
        {
          "data-testid": "char-counter",
          style: { color: title.length === 60 ? "red" : undefined },
        },
        `${title.length} / 60`
      ),
      React.createElement("button", { type: "submit" }, "Add")
    ),
    todos.length === 0
      ? React.createElement(
          "p",
          { className: "empty", "data-testid": "empty" },
          "Nothing to do yet."
        )
      : React.createElement(
          "ul",
          { "data-testid": "todo-list" },
          todos.map((todo) =>
            React.createElement(
              "li",
              { key: todo.id, className: todo.done ? "done" : "" },
              React.createElement(
                "label",
                null,
                React.createElement("input", {
                  type: "checkbox",
                  checked: todo.done,
                  onChange: () => setTodos((current) => toggleTodo(current, todo.id)),
                }),
                " ",
                React.createElement("span", null, todo.title)
              ),
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "link",
                  onClick: () => setTodos((current) => removeTodo(current, todo.id)),
                  "aria-label": `Remove ${todo.title}`,
                },
                "Remove"
              )
            )
          )
        ),
    React.createElement(
      "p",
      { className: "muted", "data-testid": "count" },
      `${remaining(todos)} left`
    )
  );
}
