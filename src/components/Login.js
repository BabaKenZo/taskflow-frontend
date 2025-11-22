import React, { useState } from "react";
import { login } from "../services/api"; // make sure your API call exists
import { useToast } from "./ToastProvider";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await login({ email, password });
      const token = response.data?.token;
      if (token) {
        localStorage.setItem("token", token);
        onLogin(token);
        try { showToast("Logged in successfully!"); } catch {}
      } else {
        setError("No token received from server.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Login failed";
      setError(msg);
      try { showToast(msg, { type: "error" }); } catch {}
    } finally { setLoading(false); }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow space-y-4 max-w-md mx-auto"
    >
      <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-200">Login</h2>

      {error && <p className="text-red-500 text-center">{error}</p>}

      <input
        type="email"
        placeholder="Email"
        className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 outline-none"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-400 outline-none"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 rounded-md text-white font-semibold transition-colors ${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {loading ? "Logging in…" : "Login"}
      </button>
    </form>
  );
};

export default Login;
