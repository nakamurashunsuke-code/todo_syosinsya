const STORAGE_KEY = "todo-items";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const remainingCount = document.getElementById("remaining-count");
const completedCount = document.getElementById("completed-count");

let todos = loadTodos();

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item) =>
        typeof item.id === "string" &&
        typeof item.text === "string" &&
        typeof item.completed === "boolean"
    );
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function updateStatus() {
  const completed = todos.filter((todo) => todo.completed).length;
  const remaining = todos.length - completed;
  remainingCount.textContent = `未完了: ${remaining}`;
  completedCount.textContent = `完了: ${completed}`;
}

function createTodoElement(todo) {
  const item = document.createElement("li");
  item.className = `todo-item${todo.completed ? " completed" : ""}`;
  item.dataset.id = todo.id;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.completed;
  checkbox.setAttribute("aria-label", "完了にする");

  const text = document.createElement("span");
  text.className = "todo-text";
  text.textContent = todo.text;

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-btn";
  deleteButton.type = "button";
  deleteButton.textContent = "削除";

  checkbox.addEventListener("change", () => toggleTodo(todo.id));
  deleteButton.addEventListener("click", () => deleteTodo(todo.id));

  item.append(checkbox, text, deleteButton);
  return item;
}

function render() {
  list.innerHTML = "";

  if (todos.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-message";
    empty.textContent = "まだタスクがありません";
    list.appendChild(empty);
  } else {
    todos.forEach((todo) => {
      list.appendChild(createTodoElement(todo));
    });
  }

  updateStatus();
}

function addTodo(text) {
  todos.unshift({
    id: crypto.randomUUID(),
    text,
    completed: false,
  });
  saveTodos();
  render();
}

function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  render();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  addTodo(text);
  input.value = "";
  input.focus();
});

render();
