import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import API from "../api";
import "./Dashboard.css";

export default function Dashboard() {
  const { user, logout, loading: authLoading } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/tasks");
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) fetchTasks();
  }, [authLoading]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      const res = await API.post("/api/tasks", { title: newTask });
      setTasks((prev) => [res.data.task, ...prev]);
      setNewTask("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = async (task) => {
    try {
      const res = await API.put(`/api/tasks/${task._id}`, { completed: !task.completed });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? res.data.task : t)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/api/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading || loading) return <p>Loading...</p>;

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <button onClick={logout}>Logout</button>

      <form onSubmit={handleAddTask}>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Task title"
        />
        <button type="submit">Add Task</button>
      </form>

      <ul>
        {tasks.map((task) => (
          <li key={task._id} className={task.completed ? "completed" : ""}>
            {task.title}
            <button onClick={() => handleToggle(task)}>
              {task.completed ? "Pending" : "Complete"}
            </button>
            <button onClick={() => handleDelete(task._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
