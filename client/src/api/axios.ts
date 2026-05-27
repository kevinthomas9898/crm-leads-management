import axios from "axios";
import { logout } from "../utils/auth";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: import.meta.env.DEV ? "/api" : "https://crm-leads-management-server.onrender.com/api",
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        "token"
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logout();
    } else if (error.response?.status === 403) {
      toast.error("Access denied. You don't have permission to perform this action.");
    } else if (error.response?.status === 500) {
      toast.error("Server error. Please try again later.");
    } else if (error.response?.status >= 400) {
      toast.error(error.response?.data?.message || "An error occurred. Please try again.");
    }
    return Promise.reject(error);
  }
);

export default api;