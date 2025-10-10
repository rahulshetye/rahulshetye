const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const auth = require("../middleware/auth");

// --- Get all tasks of the logged-in user ---
router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// --- Add a new task ---
router.post("/", auth, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ msg: "Title is required" });

    const newTask = await Task.create({ title, owner: req.user.id });
    res.status(201).json({ task: newTask });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// --- Update a task (toggle completed or update title/body) ---
router.put("/:id", auth, async (req, res) => {
  try {
    const updates = req.body; // e.g., { completed: true }
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { $set: updates },
      { new: true }
    );
    if (!task) return res.status(404).json({ msg: "Task not found" });
    res.json({ task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// --- Delete a task ---
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!task) return res.status(404).json({ msg: "Task not found" });
    res.json({ msg: "Task deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
