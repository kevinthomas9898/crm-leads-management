import api from "./axios";
import { toast } from "react-toastify";

export const fetchUsers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}) => {
  const response = await api.get("/users", { params });
  return response.data;
};

export const fetchUserById = async (id: string) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (userData: {
  name: string;
  email: string;
  password: string;
  role?: string;
}) => {
  try {
    const response = await api.post("/users", userData);
    toast.success("User created successfully!");
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to create user.");
    throw error;
  }
};

export const updateUser = async (
  id: string,
  userData: {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  }
) => {
  try {
    const response = await api.put(`/users/${id}`, userData);
    toast.success("User updated successfully!");
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to update user.");
    throw error;
  }
};

export const deleteUser = async (id: string) => {
  try {
    const response = await api.delete(`/users/${id}`);
    toast.success("User deleted successfully!");
    return response.data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to delete user.");
    throw error;
  }
};
