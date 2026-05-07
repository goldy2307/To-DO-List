const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

let tasks = [];
let nextId = 1;

app.get("/tasks", function(req, res) {
  res.json(tasks);
});

app.post("/tasks", function(req, res) {
  var text    = req.body.task;
  var dueDate = req.body.dueDate;
  var dueTime = req.body.dueTime;
  var remarks = req.body.remarks;

  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "Task cannot be empty" });
  }

  var newTask = {
    id:        nextId,
    text:      text.trim(),
    dueDate:   dueDate  || null,
    dueTime:   dueTime  || null,
    remarks:   remarks  || "",
    status:    "pending",
    createdAt: new Date().toISOString()
  };

  nextId = nextId + 1;
  tasks.push(newTask);
  res.json(newTask);
});

app.put("/tasks/:id", function(req, res) {
  var id   = parseInt(req.params.id);
  var task = null;

  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) { task = tasks[i]; break; }
  }

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  var text = req.body.task;
  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "Task cannot be empty" });
  }

  task.text    = text.trim();
  task.dueDate = req.body.dueDate || null;
  task.dueTime = req.body.dueTime || null;
  task.remarks = req.body.remarks || "";

  res.json(task);
});

app.patch("/tasks/:id/toggle", function(req, res) {
  var id   = parseInt(req.params.id);
  var task = null;

  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) { task = tasks[i]; break; }
  }

  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  if (task.status === "done") {
    task.status = "pending";
  } else {
    task.status = "done";
  }

  res.json(task);
});

app.delete("/tasks/:id", function(req, res) {
  var id    = parseInt(req.params.id);
  var index = -1;

  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].id === id) { index = i; break; }
  }

  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  tasks.splice(index, 1);
  res.json({ message: "Task deleted" });
});

app.listen(PORT, function() {
  console.log("Server is running! Open http://localhost:" + PORT);
});