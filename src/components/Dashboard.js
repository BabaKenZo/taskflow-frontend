import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Tasks from "../pages/Tasks";

export default function Dashboard({ token, onLogout }) {
  return (
    <main className="flex-1 p-4 md:p-6 bg-gray-100 dark:bg-gray-900">
      <Routes>
        {/* Default → tasks */}
        <Route index element={<Navigate to="tasks" />} />

        {/* Only Tasks */}
        <Route path="tasks" element={<Tasks token={token} onLogout={onLogout} />} />
      </Routes>
    </main>
  );
}
