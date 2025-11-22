import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { ToastProvider } from "./components/ToastProvider";

// ----------------------------------------
// Route Guards
// ----------------------------------------
function PublicRoute({ token, children }) {
  return token ? <Navigate to="/dashboard/tasks" /> : children;
}

function ProtectedRoute({ token, children }) {
  return token ? children : <Navigate to="/" />;
}

// ----------------------------------------
// App Component
// ----------------------------------------
export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [showSignup, setShowSignup] = useState(false);

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleLogin = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <ToastProvider>
      <Router>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">

          {/* Theme Toggle */}
          <div className="flex justify-end p-4">
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-full shadow"
            >
              {theme === "light" ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
              <span className="capitalize">{theme}</span>
            </button>
          </div>

          <Routes>

            {/* LOGIN + SIGNUP PAGE */}
            <Route
              path="/"
              element={
                <PublicRoute token={token}>
                  <div className="max-w-md mx-auto bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-4">
                    <h1 className="text-2xl font-bold text-center">Welcome to Taskflow</h1>

                    {showSignup ? (
                      <>
                        <Signup onLogin={handleLogin} />
                        <p className="text-center text-sm mt-2">
                          Already have an account?{" "}
                          <button onClick={() => setShowSignup(false)} className="text-indigo-500 underline">
                            Log In
                          </button>
                        </p>
                      </>
                    ) : (
                      <>
                        <Login onLogin={handleLogin} />
                        <p className="text-center text-sm mt-2">
                          Don’t have an account?{" "}
                          <button onClick={() => setShowSignup(true)} className="text-indigo-500 underline">
                            Sign Up
                          </button>
                        </p>
                      </>
                    )}
                  </div>
                </PublicRoute>
              }
            />

            {/* DASHBOARD */}
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute token={token}>
                  <Layout onLogout={handleLogout}>
                    <Dashboard token={token} onLogout={handleLogout} />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* ANY OTHER ROUTE → LOGIN */}
            <Route path="*" element={<Navigate to="/" />} />

          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}
