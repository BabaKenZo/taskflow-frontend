import axios from "axios";

const API_URL = "http://localhost:5050/api";

export const signupUser = (userdata) =>
  axios.post(`${API_URL}/auth/signup`, userdata, { headers: { "Content-Type": "application/json" } });

export const loginUser = (userdata) =>
  axios.post(`${API_URL}/auth/login`, userdata, { headers: { "Content-Type": "application/json" } });

export const createTask = (taskData, token) =>
  axios.post(`${API_URL}/tasks`, taskData, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } });

export const fetchTasks = (token) =>
  axios.get(`${API_URL}/tasks`, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } });

export const deleteTask = (taskId, token) =>
  axios.delete(`${API_URL}/tasks/${taskId}`, { headers: { Authorization: `Bearer ${token}` } });

export const updateTask = (taskId, taskData, token) =>
  axios.put(`${API_URL}/tasks/${taskId}`, taskData, { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } });
