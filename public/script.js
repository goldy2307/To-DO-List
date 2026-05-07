// ─────────────────────────────────────────────
//  Helper: get today's date as YYYY-MM-DD
// ─────────────────────────────────────────────
function getTodayStr() {
  var d = new Date();
  var year  = d.getFullYear();
  var month = String(d.getMonth() + 1).padStart(2, "0");
  var day   = String(d.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

// ─────────────────────────────────────────────
//  Build the day dropdown for current week
//  Only shows today + future days of this week
//  Past days show as disabled
// ─────────────────────────────────────────────
function buildDayOptions(selectId) {
  var select = document.getElementById(selectId);
  select.innerHTML = "";

  var today = new Date();
  today.setHours(0, 0, 0, 0);

  var dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

  // Find Monday of this week
  var monday = new Date(today);
  var diff = (today.getDay() + 6) % 7; // days since Monday
  monday.setDate(today.getDate() - diff);

  for (var i = 0; i < 7; i++) {
    var d = new Date(monday);
    d.setDate(monday.getDate() + i);

    var isPast = d < today;
    var isToday = d.toDateString() === today.toDateString();
    var isTomorrow = d.toDateString() === new Date(today.getTime() + 86400000).toDateString();

    // Make a nice label
    var label = "";
    if (isToday) {
      label = d.getDate() + " " + d.toLocaleString("default", { month: "short" }) + " — Today";
    } else if (isTomorrow) {
      label = d.getDate() + " " + d.toLocaleString("default", { month: "short" }) + " — Tomorrow";
    } else {
      label = d.getDate() + " " + d.toLocaleString("default", { month: "short" }) + " — " + dayNames[d.getDay()];
    }

    var value = d.toISOString().split("T")[0]; // YYYY-MM-DD

    var option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    option.disabled = isPast;
    if (isPast) option.classList.add("past-day");

    // default select today
    if (isToday) option.selected = true;

    select.appendChild(option);
  }
}

// ─────────────────────────────────────────────
//  Build time dropdown — every 30 minutes
// ─────────────────────────────────────────────
function buildTimeOptions(selectId) {
  var select = document.getElementById(selectId);
  select.innerHTML = "";

  // First option: no time
  var none = document.createElement("option");
  none.value = "";
  none.textContent = "— No specific time —";
  select.appendChild(none);

  var hours = ["12 AM","1 AM","2 AM","3 AM","4 AM","5 AM","6 AM","7 AM","8 AM","9 AM","10 AM","11 AM",
               "12 PM","1 PM","2 PM","3 PM","4 PM","5 PM","6 PM","7 PM","8 PM","9 PM","10 PM","11 PM"];

  for (var h = 0; h < 24; h++) {
    // :00
    var opt1 = document.createElement("option");
    var hVal = String(h).padStart(2, "0");
    opt1.value = hVal + ":00";
    opt1.textContent = hours[h] + " (00)";
    select.appendChild(opt1);

    // :30
    var opt2 = document.createElement("option");
    opt2.value = hVal + ":30";
    opt2.textContent = hours[h] + " (30)";
    select.appendChild(opt2);
  }
}

// ─────────────────────────────────────────────
//  Format a date string for display
// ─────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return "—";
  var d = new Date(dateStr + "T00:00:00");
  return d.getDate() + " " + d.toLocaleString("default", { month: "short" });
}

// ─────────────────────────────────────────────
//  Format time for display
// ─────────────────────────────────────────────
function formatTime(timeStr) {
  if (!timeStr) return "—";
  var parts = timeStr.split(":");
  var h = parseInt(parts[0]);
  var m = parts[1];
  var ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return h + ":" + m + " " + ampm;
}

// ─────────────────────────────────────────────
//  Format created-at timestamp
// ─────────────────────────────────────────────
function formatCreated(iso) {
  var d = new Date(iso);
  return d.getDate() + " " + d.toLocaleString("default", { month: "short" })
    + ", " + d.getHours() % 12 || 12
    + ":" + String(d.getMinutes()).padStart(2, "0")
    + (d.getHours() >= 12 ? " PM" : " AM");
}

// ─────────────────────────────────────────────
//  Draw the task table
// ─────────────────────────────────────────────
function renderTasks(tasks) {
  var tbody  = document.getElementById("taskBody");
  var table  = document.getElementById("taskTable");
  var empty  = document.getElementById("emptyMsg");

  tbody.innerHTML = "";

  if (tasks.length === 0) {
    table.style.display = "none";
    empty.style.display = "block";
    return;
  }

  table.style.display = "table";
  empty.style.display = "none";

  for (var i = 0; i < tasks.length; i++) {
    var t = tasks[i];
    var tr = document.createElement("tr");
    if (t.status === "done") tr.classList.add("done-row");

    var statusLabel = t.status === "done" ? "✓ Done" : "Pending";
    var statusClass = t.status === "done" ? "done" : "pending";

    tr.innerHTML =
      "<td>" + escapeHTML(t.text) + "</td>" +
      "<td>" + formatDate(t.dueDate) + "</td>" +
      "<td>" + formatTime(t.dueTime) + "</td>" +
      "<td style='color:#888;font-size:0.82rem'>" + escapeHTML(t.remarks || "—") + "</td>" +
      "<td style='color:#aaa;font-size:0.78rem'>" + formatCreated(t.createdAt) + "</td>" +
      "<td><button class='status-btn " + statusClass + "' onclick='toggleStatus(" + t.id + ")'>" + statusLabel + "</button></td>" +
      "<td><button class='edit-btn' onclick='openEdit(" + t.id + ")'>Edit</button></td>" +
      "<td><button class='del-btn' onclick='deleteTask(" + t.id + ")'>Delete</button></td>";

    tbody.appendChild(tr);
  }
}

// ─────────────────────────────────────────────
//  Escape HTML (security)
// ─────────────────────────────────────────────
function escapeHTML(str) {
  var d = document.createElement("div");
  d.appendChild(document.createTextNode(str));
  return d.innerHTML;
}

// ─────────────────────────────────────────────
//  Load tasks from backend
// ─────────────────────────────────────────────
function loadTasks() {
  fetch("/tasks")
    .then(function(res) { return res.json(); })
    .then(function(tasks) { renderTasks(tasks); });
}

// ─────────────────────────────────────────────
//  Add a new task
// ─────────────────────────────────────────────
function addTask() {
  var text    = document.getElementById("taskInput").value.trim();
  var dueDate = document.getElementById("daySelect").value;
  var dueTime = document.getElementById("timeSelect").value;
  var remarks = document.getElementById("remarks").value.trim();
  var errEl   = document.getElementById("errorMsg");

  errEl.textContent = "";

  if (!text) {
    errEl.textContent = "Please enter a task.";
    return;
  }

  fetch("/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task: text, dueDate: dueDate, dueTime: dueTime, remarks: remarks })
  })
  .then(function(res) { return res.json(); })
  .then(function() {
    document.getElementById("taskInput").value = "";
    document.getElementById("remarks").value   = "";
    loadTasks();
  });
}

// ─────────────────────────────────────────────
//  Toggle done / pending
// ─────────────────────────────────────────────
function toggleStatus(id) {
  fetch("/tasks/" + id + "/toggle", { method: "PATCH" })
    .then(function() { loadTasks(); });
}

// ─────────────────────────────────────────────
//  Delete a task
// ─────────────────────────────────────────────
function deleteTask(id) {
  fetch("/tasks/" + id, { method: "DELETE" })
    .then(function() { loadTasks(); });
}

// ─────────────────────────────────────────────
//  Open edit popup
// ─────────────────────────────────────────────
var allTasks = []; // store tasks for edit lookup

function openEdit(id) {
  var task = null;
  for (var i = 0; i < allTasks.length; i++) {
    if (allTasks[i].id === id) { task = allTasks[i]; break; }
  }
  if (!task) return;

  document.getElementById("editId").value      = id;
  document.getElementById("editTask").value    = task.text;
  document.getElementById("editRemarks").value = task.remarks || "";

  // rebuild selects and set saved values
  buildDayOptions("editDay");
  buildTimeOptions("editTime");

  if (task.dueDate) document.getElementById("editDay").value  = task.dueDate;
  if (task.dueTime) document.getElementById("editTime").value = task.dueTime;

  document.getElementById("editBox").classList.remove("hidden");
  document.getElementById("overlay").classList.remove("hidden");
}

function closeEdit() {
  document.getElementById("editBox").classList.add("hidden");
  document.getElementById("overlay").classList.add("hidden");
}

function saveEdit() {
  var id      = parseInt(document.getElementById("editId").value);
  var text    = document.getElementById("editTask").value.trim();
  var dueDate = document.getElementById("editDay").value;
  var dueTime = document.getElementById("editTime").value;
  var remarks = document.getElementById("editRemarks").value.trim();

  if (!text) { alert("Task cannot be empty."); return; }

  fetch("/tasks/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task: text, dueDate: dueDate, dueTime: dueTime, remarks: remarks })
  })
  .then(function() {
    closeEdit();
    loadTasks();
  });
}

// ─────────────────────────────────────────────
//  Enter key to add task
// ─────────────────────────────────────────────
document.getElementById("taskInput").addEventListener("keydown", function(e) {
  if (e.key === "Enter") addTask();
});

// ─────────────────────────────────────────────
//  On page load — build dropdowns & load tasks
// ─────────────────────────────────────────────
buildDayOptions("daySelect");
buildTimeOptions("timeSelect");

// Keep allTasks updated on every load
function loadTasks() {
  fetch("/tasks")
    .then(function(res) { return res.json(); })
    .then(function(tasks) {
      allTasks = tasks;
      renderTasks(tasks);
    });
}

loadTasks();