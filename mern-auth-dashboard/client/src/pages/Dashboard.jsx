import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import API from "../api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format, parseISO } from "date-fns";

export default function Dashboard() {
  const { user, logout, loading: authLoading } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [search, setSearch] = useState("");
  const [filterCompleted, setFilterCompleted] = useState("all");
  const [loading, setLoading] = useState(true);

  // Fetch tasks
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/tasks");
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) fetchTasks();
  }, [authLoading]);

  // Add task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      const res = await API.post("/api/tasks", { title: newTask });
      setTasks((prev) => [res.data.task, ...prev]);
      setNewTask("");
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  // Delete task
  const handleDelete = async (id) => {
    try {
      await API.delete(`/api/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  // Toggle completed
  const handleToggle = async (task) => {
    try {
      const res = await API.put(`/api/tasks/${task._id}`, {
        completed: !task.completed,
      });
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? res.data.task : t))
      );
    } catch (err) {
      console.error("Failed to toggle task:", err);
    }
  };

  // Filtered tasks
  const filteredTasks = tasks
    .filter((t) => {
      if (filterCompleted === "completed") return t.completed;
      if (filterCompleted === "pending") return !t.completed;
      return true;
    })
    .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.filter((t) => !t.completed).length;

  const pieData = [
    { name: "Completed", value: completedCount },
    { name: "Pending", value: pendingCount },
  ];

  const COLORS = ["#34D399", "#FBBF24"];

  const tasksPerDay = () => {
    const map = {};
    tasks.forEach((task) => {
      if (task.completed && task.updatedAt) {
        const day = format(parseISO(task.updatedAt), "yyyy-MM-dd");
        map[day] = (map[day] || 0) + 1;
      }
    });
    return Object.keys(map)
      .sort()
      .map((date) => ({ date, completed: map[date] }));
  };

  const taskTrendData = tasksPerDay();

  if (authLoading || loading) return <p>Loading...</p>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={logout}>Logout</button>
      </div>

      <div className="task-list">
        <form onSubmit={handleAddTask}>
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Task title"
          />
          <button type="submit">Add</button>
        </form>

        {filteredTasks.map((task) => (
          <div key={task._id} className={task.completed ? "completed" : ""}>
            <span>{task.title}</span>
            <button onClick={() => handleToggle(task)}>
              {task.completed ? "Pending" : "Complete"}
            </button>
            <button onClick={() => handleDelete(task._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
