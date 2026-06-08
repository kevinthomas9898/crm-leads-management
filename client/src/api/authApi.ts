import api from "./axios";
import { toast } from "react-toastify";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export const loginUser = async (data: LoginData) => {
  try {
    const response = await api.post("/auth/login", data);
    toast.success("Login successful!");
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const registerUser = async (data: RegisterData) => {
  try {
    const response = await api.post("/auth/register", data);
    toast.success("Registration successful! Please login.");
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
