import axios from "axios";

// Use Render backend instead of localhost
const API_URL = "https://taskflow-backend-qpr4.onrender.com/api";

// Auth requests
export const signup = (userdata) =>
  axios.post(`${API_URL}/auth/signup`, userdata);

export const login = (userdata) =>
  axios.post(`${API_URL}/auth/login`, userdata);

// Task CRUD requests (Token required)
export const createTask = (taskData, token) =>
  axios.post(`${API_URL}/tasks`, taskData, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const fetchTasks = (token) =>
  axios.get(`${API_URL}/tasks`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const deleteTask = (taskId, token) =>
  axios.delete(`${API_URL}/tasks/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const updateTask = (taskId, taskData, token) =>
  axios.put(`${API_URL}/tasks/${taskId}`, taskData, {
    headers: { Authorization: `Bearer ${token}` }
  });
