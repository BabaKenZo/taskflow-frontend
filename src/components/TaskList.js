import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { fetchTasks, updateTask, deleteTask } from "../services/api";
import { useToast } from "./ToastProvider";
import Sortable from "sortablejs";

const statusStyles = {
  pending: "bg-gray-200 text-gray-800",
  "in-progress": "bg-yellow-200 text-yellow-800",
  completed: "bg-green-200 text-green-800",
};

const taskContainerStyles = {
  pending: "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600",
  "in-progress": "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 dark:border-yellow-500",
  completed: "bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600",
};

const DEFAULT_CATEGORIES = ["General", "Work", "Personal", "Errand"];

const TaskList = forwardRef(({ token, onLogout }, ref) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // modal state
  const [isOpen, setIsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  const listRef = useRef(null);
  const sortableRef = useRef(null);

  const { showToast } = useToast();

  // expose loadTasks to parent via ref
  useImperativeHandle(ref, () => ({
    loadTasks,
  }));

  const handleApiError = useCallback(
    (err) => {
      if (err?.response && err.response.status === 401 && onLogout) {
        onLogout();
        return "Session expired. Please log in again.";
      }
      return err?.response?.data?.message || err?.message || "Unknown error";
    },
    [onLogout]
  );

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchTasks(token);
      const list = Array.isArray(res.data) ? res.data : res.data.tasks || [];
      const withOrder = list
        .map((t, i) => ({ ...t, order: typeof t.order === "number" ? t.order : i }))
        .sort((a, b) => a.order - b.order);
      setTasks(withOrder);

      const cats = Array.from(new Set([...DEFAULT_CATEGORIES, ...withOrder.map((t) => t.category).filter(Boolean)]));
      setCategories(cats);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [token, handleApiError]);

  useEffect(() => {
    if (token) loadTasks();
  }, [loadTasks, token]);

  // ---------------- Safe SortableJS ----------------
  useEffect(() => {
    if (!listRef.current) return;

    if (sortableRef.current && sortableRef.current.el) {
      sortableRef.current.destroy();
      sortableRef.current = null;
    }

    sortableRef.current = Sortable.create(listRef.current, {
      handle: ".drag-handle",
      animation: 150,
      onEnd: async (evt) => {
        const { oldIndex, newIndex } = evt;
        if (oldIndex == null || newIndex == null || oldIndex === newIndex) return;

        const newOrder = Array.from(tasks);
        const [moved] = newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, moved);

        const withOrder = newOrder.map((t, i) => ({ ...t, order: i }));
        setTasks(withOrder);

        try {
          const updates = withOrder.map((t, i) => updateTask(t._id, { order: i }, token));
          await Promise.all(updates);
          showToast("Order updated");
        } catch (err) {
          showToast(handleApiError(err), { type: "error" });
          loadTasks();
        }
      },
    });

    return () => {
      if (sortableRef.current && sortableRef.current.el) {
        sortableRef.current.destroy();
        sortableRef.current = null;
      }
    };
  }, [tasks, token, handleApiError, loadTasks, showToast]);
  // ------------------------------------------------

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    const prev = tasks;
    setTasks((t) => t.filter((task) => task._id !== id));

    try {
      await deleteTask(id, token);
      showToast("Task deleted");
    } catch (err) {
      setTasks(prev);
      showToast(handleApiError(err), { type: "error" });
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const prev = tasks;
    setTasks((t) => t.map((task) => (task._id === id ? { ...task, status: newStatus } : task)));

    try {
      await updateTask(id, { status: newStatus }, token);
      showToast("Status updated");
    } catch (err) {
      setTasks(prev);
      showToast(handleApiError(err), { type: "error" });
    }
  };

  const openEditModal = (task) => {
    setEditingTask({ ...task });
    setIsOpen(true);
  };
  const closeModal = () => {
    setIsOpen(false);
    setEditingTask(null);
  };

  const saveEdit = async () => {
    if (!editingTask) return;
    const id = editingTask._id;
    const prev = tasks;

    setTasks((t) => t.map((task) => (task._id === id ? { ...task, ...editingTask } : task)));

    try {
      const payload = {
        title: editingTask.title,
        description: editingTask.description,
        status: editingTask.status,
        category: editingTask.category,
        tags: editingTask.tags,
        dueDate: editingTask.dueDate,
      };

      await updateTask(id, payload, token);
      showToast("Task updated");
      closeModal();
    } catch (err) {
      setTasks(prev);
      showToast(handleApiError(err), { type: "error" });
    }
  };

  const setTagsFromInput = (val) => {
    const tags = val
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setEditingTask((s) => ({ ...s, tags }));
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold mb-4">Your Tasks</h2>
        <div className="text-sm text-gray-500">Drag handle to reorder</div>
      </div>

      {loading && <p>Loading tasks...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && tasks.length === 0 && <p className="text-gray-400">No tasks yet. Create one above!</p>}

      <ul ref={listRef} className="space-y-4">
        {tasks.map((task) => (
          <li
            key={task._id}
            className={`p-4 border rounded-lg shadow-sm ${taskContainerStyles[task.status]} flex items-start gap-3`}
          >
            <div className="drag-handle cursor-grab p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 4a1 1 0 100 2 1 1 0 000-2zM7 9a1 1 0 100 2 1 1 0 000-2zM7 14a1 1 0 100 2 1 1 0 000-2zM13 4a1 1 0 100 2 1 1 0 000-2zM13 9a1 1 0 100 2 1 1 0 000-2zM13 14a1 1 0 100 2 1 1 0 000-2z" />
              </svg>
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                  {task.description && <p className="text-sm mt-1 opacity-80">{task.description}</p>}

                  <div className="mt-2 flex gap-2 items-center text-sm">
                    {task.category && (
                      <span className="px-2 py-0.5 rounded text-xs border">{task.category}</span>
                    )}
                    {task.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {task.tags.map((tag) => (
                          <span key={tag} className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {task.dueDate && (
                      <span className="ml-2 text-xs text-gray-600">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-semibold ml-4 ${statusStyles[task.status]}`}>
                  {task.status}
                </span>
              </div>

              <div className="flex items-center justify-between mt-4">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task._id, e.target.value)}
                  className="border px-2 py-1 rounded dark:bg-gray-700"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>

                <div className="flex gap-3">
                  <button onClick={() => openEditModal(task)} className="text-blue-600 hover:underline">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(task._id)} className="text-red-600 hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black opacity-40" onClick={closeModal} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mx-4 z-10">
            <h3 className="text-lg font-medium">Edit Task</h3>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <input
                value={editingTask?.title || ""}
                onChange={(e) => setEditingTask((s) => ({ ...s, title: e.target.value }))}
                placeholder="Title"
                className="w-full p-2 border rounded dark:bg-gray-700"
              />
              <textarea
                value={editingTask?.description || ""}
                onChange={(e) => setEditingTask((s) => ({ ...s, description: e.target.value }))}
                placeholder="Description"
                rows={4}
                className="w-full p-2 border rounded dark:bg-gray-700"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  value={editingTask?.status || "pending"}
                  onChange={(e) => setEditingTask((s) => ({ ...s, status: e.target.value }))}
                  className="border px-2 py-1 rounded dark:bg-gray-700"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>

                <select
                  value={editingTask?.category || ""}
                  onChange={(e) => setEditingTask((s) => ({ ...s, category: e.target.value }))}
                  className="border px-2 py-1 rounded dark:bg-gray-700"
                >
                  <option value="">Uncategorized</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={editingTask?.dueDate ? editingTask.dueDate.split("T")[0] : ""}
                  onChange={(e) => setEditingTask((s) => ({ ...s, dueDate: e.target.value }))}
                  className="border px-2 py-1 rounded dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="text-sm">Tags (comma separated)</label>
                <input
                  value={(editingTask?.tags || []).join(", ")}
                  onChange={(e) => setTagsFromInput(e.target.value)}
                  placeholder="e.g. urgent, frontend"
                  className="w-full p-2 border rounded dark:bg-gray-700 mt-1"
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button onClick={saveEdit} className="px-4 py-2 bg-blue-600 text-white rounded">
                  Save
                </button>
                <button onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded dark:bg-gray-700">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default TaskList;
