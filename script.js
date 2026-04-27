const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const remainingCount = document.getElementById("remaining-count");
const completedCount = document.getElementById("completed-count");
const appMessage = document.getElementById("app-message");

let todos = [];
const config = window.APP_CONFIG || {};
const supabaseUrl = config.SUPABASE_URL;
const supabaseAnonKey = config.SUPABASE_ANON_KEY;
const client =
  supabaseUrl && supabaseAnonKey
    ? window.supabase.createClient(supabaseUrl, supabaseAnonKey)
    : null;

function setMessage(message, isError = false) {
  appMessage.textContent = message;
  appMessage.classList.toggle("error", isError);
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
  item.dataset.id = String(todo.id);

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

  checkbox.addEventListener("change", () => {
    void toggleTodo(todo.id, checkbox.checked);
  });
  deleteButton.addEventListener("click", () => {
    void deleteTodo(todo.id);
  });

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

async function fetchTodos() {
  const { data, error } = await client
    .from("todos")
    .select("id, text, completed, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  todos = data || [];
  render();
}

async function addTodo(text) {
  const { error } = await client.from("todos").insert({ text, completed: false });
  if (error) throw error;

  await fetchTodos();
}

async function toggleTodo(id, completed) {
  const { error } = await client.from("todos").update({ completed }).eq("id", id);
  if (error) throw error;

  await fetchTodos();
}

async function deleteTodo(id) {
  const { error } = await client.from("todos").delete().eq("id", id);
  if (error) throw error;

  await fetchTodos();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  void (async () => {
    try {
      await addTodo(text);
      input.value = "";
      input.focus();
      setMessage("タスクを追加しました");
    } catch {
      setMessage("タスク追加に失敗しました", true);
    }
  })();
});

async function initialize() {
  if (!client) {
    setMessage("config.js に Supabase の URL と anon key を設定してください", true);
    return;
  }

  setMessage("読み込み中...");
  try {
    await fetchTodos();
    setMessage("");
  } catch {
    setMessage("Supabase接続に失敗しました。設定とテーブル作成を確認してください", true);
  }
}

void initialize();
