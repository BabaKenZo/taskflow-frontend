import React, { useState } from "react";
import { createTask } from "../services/api";
import { useToast } from "./ToastProvider";

const DEFAULT_CATEGORIES = ["General", "Work", "Personal", "Errand"];

export default function TaskForm({ token, onTaskAdded }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { title, description, category, tags: tags.split(",").map(t => t.trim()).filter(Boolean) };
      await createTask(payload, token);
      showToast("Task created!");
      setTitle(""); setDescription(""); setCategory(""); setTags("");
      onTaskAdded?.();
    } catch (err) {
      showToast(err.message || "Failed to create task", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 outline-none"
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 outline-none"
        >
          <option value="">Category</option>
          {DEFAULT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 outline-none"
      />
      <input
        type="text"
        placeholder="Tags (comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 outline-none"
      />
      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 rounded text-white font-semibold transition-colors ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {loading ? "Creating..." : "Create Task"}
      </button>
    </form>
  );
}
