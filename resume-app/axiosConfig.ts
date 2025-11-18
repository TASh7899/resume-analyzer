import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("API error:", error);
    return Promise.reject(error);
  }
);

export default api;


