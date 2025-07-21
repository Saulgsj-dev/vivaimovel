// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://tafimbackendrender.onrender.com", // ou a URL do backend no Vercel
});

export default api;
