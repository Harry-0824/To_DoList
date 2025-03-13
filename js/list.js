let emptyState; //存放顯示「沒有任務」提示的 DOM 元素
let taskList; //存放任務列表的 DOM 元素

// 註冊了一個事件監聽器，等到 HTML 文檔加載完成後（DOM 結構已經建立）
// 執行裡面的回調函數，保證所有需要操作的 DOM 元素都已經存在。
document.addEventListener("DOMContentLoaded", function () {
  //使用 getElementById 取得表單、輸入欄位、日期欄位、任務列表和空狀態提示元素。

  const taskForm = document.getElementById("task-form");
  const taskInput = document.getElementById("task-input");
  const dateInput = document.getElementById("date-input");
  taskList = document.getElementById("task-list");
  emptyState = document.getElementById("empty-state");

  // 設置今天的日期為預設值
  const today = new Date();
  //toISOString() 將日期轉成 ISO 格式
  //再透過 slice(0, 10) 取出 "YYYY-MM-DD" 的格式，並賦值給日期輸入欄位。
  const formattedDate = today.toISOString().slice(0, 10);
  dateInput.value = formattedDate;

  //在 DOM 加載完成後立即調用 loadTasks()
  //目的是從 localStorage 中讀取已存的任務並將它們顯示出來。
  loadTasks();

  // 新增任務事件
  taskForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const taskText = taskInput.value.trim();
    const taskDate = dateInput.value;

    if (taskText && taskDate) {
      addTask(taskText, taskDate);

      // 清空輸入欄位
      taskInput.value = "";
      dateInput.value = formattedDate;

      // 重新聚焦到任務輸入欄位
      taskInput.focus();
    }
  });
});
// 新增任務函數
function addTask(text, date) {
  // 創建任務對象
  const task = {
    id: Date.now(),
    text: text,
    date: date,
    completed: false,
  };
  // 添加到localStorage
  saveTask(task);

  // 創建任務元素
  createTaskElement(task);

  // 如果有任務則隱藏空狀態提示
  updateEmptyState();
}

// 創建任務DOM元素函數
function createTaskElement(task) {
  if (!taskList) {
    console.error("taskList 未定義");
    return;
  }
  const taskItem = document.createElement("li");
  taskItem.classList.add("task-item");
  taskItem.dataset.id = task.id;

  const taskContent = document.createElement("div");
  taskContent.classList.add("task-content");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.classList.add("task-checkbox");
  checkbox.checked = task.completed;

  const taskText = document.createElement("span");
  taskText.classList.add("task-text");
  taskText.textContent = task.text;
  if (task.completed) {
    taskText.style.textDecoration = "line-through";
    taskText.style.color = "#999";
  }

  const taskDate = document.createElement("span");
  taskDate.classList.add("task-date");
  taskDate.textContent = formatDate(task.date);

  const taskActions = document.createElement("div");
  taskActions.classList.add("task-actions");

  const editBtn = document.createElement("button");
  editBtn.classList.add("edit-btn");
  editBtn.textContent = "編輯";

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("delete-btn");
  deleteBtn.textContent = "刪除";

  taskContent.appendChild(checkbox);
  taskContent.appendChild(taskText);
  taskContent.appendChild(taskDate);

  taskActions.appendChild(editBtn);
  taskActions.appendChild(deleteBtn);

  taskItem.appendChild(taskContent);
  taskItem.appendChild(taskActions);

  taskList.appendChild(taskItem);

  // 添加事件監聽器
  checkbox.addEventListener("change", function () {
    toggleTaskComplete(task.id, this.checked);
    taskText.style.textDecoration = this.checked ? "line-through" : "none";
    taskText.style.color = this.checked ? "#999" : "#000";
  });

  deleteBtn.addEventListener("click", function () {
    if (confirm("確定要刪除這個任務嗎？")) {
      removeTask(task.id);
      taskItem.remove();
      updateEmptyState();
    }
  });

  editBtn.addEventListener("click", function () {
    const newText = prompt("編輯任務:", task.text);
    if (newText !== null && newText.trim() !== "") {
      taskText.textContent = newText;
      updateTask(task.id, newText, task.date, task.completed);
    }
  });
}

// 保存任務到localStorage
function saveTask(task) {
  const tasks = getTasks();
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// 從localStorage獲取任務
function getTasks() {
  return JSON.parse(localStorage.getItem("tasks") || "[]");
}

// 從localStorage加載任務
function loadTasks() {
  const tasks = getTasks();

  if (tasks.length > 0) {
    emptyState.style.display = "none";
  }

  tasks.forEach((task) => {
    createTaskElement(task);
  });
}

// 在localStorage中更新任務
function updateTask(id, text, date, completed) {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex((task) => task.id === id);

  if (taskIndex !== -1) {
    tasks[taskIndex].text = text;
    tasks[taskIndex].date = date;
    tasks[taskIndex].completed = completed;
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
}

// 切換任務完成狀態
function toggleTaskComplete(id, completed) {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex((task) => task.id === id);

  if (taskIndex !== -1) {
    tasks[taskIndex].completed = completed;
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
}

// 從localStorage移除任務
function removeTask(id) {
  const tasks = getTasks();
  const filteredTasks = tasks.filter((task) => task.id !== id);
  localStorage.setItem("tasks", JSON.stringify(filteredTasks));
}

// 更新空狀態提示的可見性
function updateEmptyState() {
  const tasks = getTasks();
  emptyState.style.display = tasks.length > 0 ? "none" : "flex";
}

// 格式化日期顯示
function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("zh-TW", options);
}
