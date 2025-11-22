import React, { useState } from "react";
import { createTask } from "../services/api";
import { useToast } from "./ToastProvider";

const CreateTask = ({ token, onTaskCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const usedToken = token || localStorage.getItem("token");
      if (!usedToken) throw new Error("Please log in to create tasks.");

      const taskData = { title, description, status };
      const response = await createTask(taskData, usedToken);

      setTitle("");
      setDescription("");
      setStatus("pending");
      if (onTaskCreated) onTaskCreated();

      try { showToast(`Task created: ${response.data?.title || "task"}`); } catch {}
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to create task.";
      try { showToast(msg, { type: "error" }); } catch {}
      console.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow space-y-3"
    >
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Create New Task</h2>

      <input
        className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 outline-none"
        type="text"
        placeholder="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 outline-none"
        placeholder="Task Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />

      <select
        className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 outline-none"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="pending">Pending</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      <button
        type="submit"
        className={`w-full py-2 rounded-md font-semibold text-white transition-transform ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
        }`}
        disabled={loading}
      >
        {loading ? "Creating…" : "Create Task"}
      </button>
    </form>
  );
};

export default CreateTask;
