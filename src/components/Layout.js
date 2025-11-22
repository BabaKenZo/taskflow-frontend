import React from "react";
import { Link } from "react-router-dom";
import { ListBulletIcon, ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";

export default function Layout({ children, onLogout }) {
  return (
    <div className="flex min-h-screen">

      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-100 dark:bg-gray-800 p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-6">Taskflow</h2>

        <nav className="space-y-3">
          <Link
            to="/dashboard/tasks"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <ListBulletIcon className="w-5 h-5" />
            Tasks
          </Link>

          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 w-full mt-10"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
