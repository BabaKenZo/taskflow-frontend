import React, { useRef } from "react";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";

export default function Tasks({ token, onLogout }) {
  const listRef = useRef();

  // Refresh task list after adding a new task
  const refreshTasks = () => {
    if (listRef.current) listRef.current.loadTasks();
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Task Creation Form */}
      <div className="md:w-1/3 w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Create Task</h2>
        <TaskForm token={token} onTaskAdded={refreshTasks} />
      </div>

      {/* Task List */}
      <div className="md:w-2/3 w-full bg-gray-50 dark:bg-gray-800 p-4 rounded-xl shadow">
        <TaskList ref={listRef} token={token} onLogout={onLogout} />
      </div>
    </div>
  );
}
