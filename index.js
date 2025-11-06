import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

export const auth = {
  signup: (data) => axios.post(`${API_URL}/auth/signup`, data),
  loginWithForm: (form) => axios.post(`${API_URL}/auth/token`, form),
  me: () => axios.get(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  }),
};

export const events = {
  getAll: () => axios.get(`${API_URL}/events`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  }),
  create: (data) => axios.post(`${API_URL}/events`, data, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  }),
};
