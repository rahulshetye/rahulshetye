import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format, parseISO } from "date-fns";
import "../styles/dashboard.css"; // separate CSS file

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [search, setSearch] = useState("");
  const [filterCompleted, setFilterCompleted] = useState("all");
  const [loading, setLoading] = useState(true);

  const API_URL = `${import.meta.env.VITE_API_URL}/api/tasks`;


  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, { credentials: "include" });
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: newTask }),
      });
      const data = await res.json();
      setTasks((prev) => [data.task, ...prev]);
      setNewTask("");
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE", credentials: "include" });
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const handleToggle = async (task) => {
    try {
      const res = await fetch(`${API_URL}/${task._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ completed: !task.completed }),
      });
      const data = await res.json();
      setTasks((prev) => prev.map((t) => (t._id === task._id ? data.task : t)));
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

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

  const COLORS = ["#34D399", "#FBBF24"]; // green and yellow

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

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={logout}>Logout</button>
      </div>

      {/* Profile + Stats Grid */}
      <div className="grid-container">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="avatar">
            <img src={`https://ui-avatars.com/api/?name=${user?.name}`} alt="avatar" />
          </div>
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          <p className="welcome-text">Welcome back!</p>
        </div>

        {/* Stats Cards */}
        <div className="stat-card total-tasks">
          <h2>Total Tasks</h2>
          <p>{tasks.length}</p>
        </div>
        <div className="stat-card completed-tasks">
          <h2>Completed</h2>
          <p>{completedCount}</p>
        </div>
        <div className="stat-card pending-tasks">
          <h2>Pending</h2>
          <p>{pendingCount}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Pie Chart */}
        <div className="chart-card">
          <h2>Task Status Pie</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

       {/* Simple Tasks Bar Chart */}
<div className="chart-card bg-white p-4 rounded-lg shadow mb-6">
  <h2 className="text-xl font-semibold mb-2">Tasks Overview</h2>
  <ResponsiveContainer width="100%" height={250}>
  <BarChart
    data={[
      { name: "Completed", count: tasks.filter(t => t.completed).length },
      { name: "Pending", count: tasks.filter(t => !t.completed).length },
    ]}
  >
    <XAxis dataKey="name" />
    <YAxis allowDecimals={false} />
    <Tooltip />
    <Bar dataKey="count">
      {[
        { name: "Completed", count: tasks.filter(t => t.completed).length },
        { name: "Pending", count: tasks.filter(t => !t.completed).length },
      ].map((entry, index) => (
        <Cell
          key={`cell-${index}`}
          fill={entry.name === "Completed" ? "#34D399" : "#FBBF24"} // green for completed, yellow for pending
        />
      ))}
    </Bar>
  </BarChart>
</ResponsiveContainer>

</div>


      </div>

      {/* Add Task */}
      <div className="add-task-card">
        <h2>Add Task</h2>
        <form onSubmit={handleAddTask}>
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Task title"
          />
          <button type="submit">Add</button>
        </form>
      </div>

      {/* Task List */}
      <ul className="task-list">
        {filteredTasks.map((task) => (
          <li key={task._id} className={task.completed ? "task-completed" : "task-pending"}>
            <div className="task-title">{task.title}</div>
            <div className="task-actions">
              <button onClick={() => handleToggle(task)}>
                {task.completed ? "Turn Pending" : "Turn Complete"}
              </button>
              <button onClick={() => handleDelete(task._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
