import { toast } from "react-toastify";

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  
  toast.error("Session expired. Please login again.");
  
  setTimeout(() => {
    window.location.href = "/login";
  }, 3500);
};
